import * as StellarSdk from '@stellar/stellar-sdk';

// Use strict types for the contract
const {
  xdr,
  scValToNative,
  Address,
  nativeToScVal,
} = StellarSdk;

// Safe access to SorobanRpc
// @ts-ignore
const SorobanRpc = StellarSdk.SorobanRpc || StellarSdk.rpc;
const Server = SorobanRpc?.Server;

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CD73R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3R2Q3";
const RPC_URL = import.meta.env.VITE_SOROBAN_RPC || "https://soroban-testnet.stellar.org";

const isDemoMode = CONTRACT_ID.startsWith("CD73R2Q3");

export interface OnChainFund {
  id: number;
  funderAddress: string;
  beneficiaryAddress: string;
  verifierAddress: string;
  amount: string; // in XLM
  deadline: string; // ISO String
  status: string;
  proofHash: string;
  requirementHash: string;
  // Enriched fields from local storage
  conditions?: string;
  proofDescription?: string;
  ipfsHash?: string;
  feedbackStatus?: string;
  createdAt?: string;
}

export class SorobanDataService {
  private server: any;

  constructor() {
    if (Server) {
      this.server = new Server(RPC_URL);
    }
  }

  // Helper to encode DataKey::Fund(u64)
  private getFundKey(id: number): string {
    const scVal = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Fund"),
      xdr.ScVal.scvU64(xdr.Uint64.fromString(id.toString()))
    ]);
    return scVal.toXDR('base64');
  }

  // Helper to encode DataKey::NextFundId
  private getNextIdKey(): string {
     // DataKey is an enum, so even unit variants are encoded as a Vec with one Symbol
     const scVal = xdr.ScVal.scvVec([
       xdr.ScVal.scvSymbol("NextFundId")
     ]);
     return scVal.toXDR('base64');
  }

  async getNextFundId(): Promise<number> {
    if (isDemoMode) {
        const nextId = localStorage.getItem('demo_next_id');
        return nextId ? parseInt(nextId) : 0;
    }

    if (!this.server) return 0;
    try {
        const key = this.getNextIdKey();
        const result = await this.server.getContractData(CONTRACT_ID, xdr.ScVal.fromXDR(key, 'base64'));
        
        if (!result || !result.val) return 0;
        
        const val = scValToNative(result.val);
        return Number(val);
    } catch (e) {
        console.warn("Could not fetch NextFundId (might be 0 or contract not initialized)", e);
        return 0;
    }
  }

  async getFund(id: number): Promise<OnChainFund | null> {
    if (isDemoMode) {
        const data = localStorage.getItem(`demo_fund_state_${id}`);
        if (!data) return null;
        const raw = JSON.parse(data);
        return {
             ...raw,
             ...this.getLocalMetadata(id) 
        };
    }

    if (!this.server) return null;
    try {
      const key = this.getFundKey(id);
      const result = await this.server.getContractData(CONTRACT_ID, xdr.ScVal.fromXDR(key, 'base64'));

      if (!result || !result.val) return null;

      const raw = scValToNative(result.val);
      
      // Determine Status String
      let statusStr = "Locked";
      
      // Handle different ways enum might be returned
      let statusVal = raw.status;
      if (Array.isArray(raw.status) && raw.status.length > 0) {
        statusVal = raw.status[0];
      }
      if (typeof statusVal === 'object' && statusVal.tag) {
        statusVal = statusVal.tag;
      }

      // Rust Enum: Pending, ProofSubmitted, Approved, Released, Refunded
      if (statusVal === "Pending" || statusVal === 0) statusStr = "Locked";
      else if (statusVal === "ProofSubmitted" || statusVal === 1) statusStr = "Pending Verification";
      else if (statusVal === "Approved" || statusVal === 2) statusStr = "Approved";
      else if (statusVal === "Released" || statusVal === 3) statusStr = "Released";
      else if (statusVal === "Refunded" || statusVal === 4) statusStr = "Rejected";

      // Amount is i128 (stroops)
      const amountStroops = typeof raw.amount === 'bigint' ? raw.amount : BigInt(raw.amount);
      const amountXlm = (Number(amountStroops) / 10_000_000).toFixed(2);

      // Deadline is u64 (seconds)
      const deadlineSeconds = typeof raw.deadline === 'bigint' ? Number(raw.deadline) : Number(raw.deadline);
      const deadlineDate = new Date(deadlineSeconds * 1000).toISOString();

      return {
        id,
        funderAddress: raw.funder,
        beneficiaryAddress: raw.beneficiary,
        verifierAddress: raw.verifier,
        amount: amountXlm,
        deadline: deadlineDate,
        status: statusStr,
        proofHash: raw.proof_hash?.toString('hex') || "",
        requirementHash: raw.requirement_hash?.toString('hex') || "",
        // Enrich from local storage
        ...this.getLocalMetadata(id)
      };

    } catch (e) {
      console.error(`Failed to fetch fund ${id}`, e);
      return null;
    }
  }

  async getAllFunds(): Promise<OnChainFund[]> {
    const nextId = await this.getNextFundId();
    const funds: OnChainFund[] = [];
    
    // Reverse loop to show newest first
    for (let i = nextId - 1; i >= 0; i--) {
        const fund = await this.getFund(i);
        if (fund) funds.push(fund);
    }
    return funds;
  }

  // Local Metadata Helper (Zero Backend)
  saveLocalMetadata(id: number, conditions: string, proofDescription?: string, ipfsHash?: string, feedbackStatus?: string) {
    const data = { conditions, proofDescription, ipfsHash, feedbackStatus };
    localStorage.setItem(`fund_meta_${id}`, JSON.stringify(data));
  }

  getLocalMetadata(id: number) {
    const data = localStorage.getItem(`fund_meta_${id}`);
    if (data) return JSON.parse(data);
    // Return "Demo" data if missing
    return {
        conditions: "Complete the milestone deliverables as specified in the agreement.",
        proofDescription: "Proof submission Pending..."
    };
  }

  mockCreateFund(fund: Partial<OnChainFund>) {
      const nextIdStr = localStorage.getItem('demo_next_id') || "0";
      const id = parseInt(nextIdStr);
      
      const newFund = {
          id,
          funderAddress: fund.funderAddress,
          beneficiaryAddress: fund.beneficiaryAddress,
          verifierAddress: fund.verifierAddress,
          amount: fund.amount,
          deadline: fund.deadline,
          status: "Locked",
          proofHash: "",
          requirementHash: fund.requirementHash || "",
          createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`demo_fund_state_${id}`, JSON.stringify(newFund));
      if (fund.conditions) {
          this.saveLocalMetadata(id, fund.conditions);
      }
      localStorage.setItem('demo_next_id', (id + 1).toString());
      return id;
  }

  mockUpdateFundStatus(id: number, status: string, proofHash?: string) {
      const data = localStorage.getItem(`demo_fund_state_${id}`);
      if (!data) return;
      const fund = JSON.parse(data);
      fund.status = status;
      if (proofHash) fund.proofHash = proofHash;
      localStorage.setItem(`demo_fund_state_${id}`, JSON.stringify(fund));
  }
}

export const sorobanData = new SorobanDataService();
