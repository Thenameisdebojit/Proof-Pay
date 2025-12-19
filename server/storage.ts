import {
  type Fund,
  type InsertFund,
  type SubmitProofRequest,
  type VerifyFundRequest
} from "@shared/schema";

export interface IStorage {
  getFunds(role?: string, address?: string): Promise<Fund[]>;
  getFund(id: number): Promise<Fund | undefined>;
  createFund(fund: InsertFund): Promise<Fund>;
  submitProof(id: number, proof: SubmitProofRequest): Promise<Fund>;
  verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund>;
}

export class MemStorage implements IStorage {
  private funds: Map<number, Fund>;
  private currentId: number;

  constructor() {
    this.funds = new Map();
    this.currentId = 1;
  }

  async getFunds(role?: string, address?: string): Promise<Fund[]> {
    let allFunds = Array.from(this.funds.values()).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    if (role && address) {
      if (role === 'Funder') {
        allFunds = allFunds.filter(f => f.funderAddress === address);
      } else if (role === 'Beneficiary') {
        allFunds = allFunds.filter(f => f.beneficiaryAddress === address);
      } else if (role === 'Verifier') {
        allFunds = allFunds.filter(f => f.verifierAddress === address);
      }
    }
    return allFunds;
  }

  async getFund(id: number): Promise<Fund | undefined> {
    return this.funds.get(id);
  }

  async createFund(insertFund: InsertFund): Promise<Fund> {
    const id = this.currentId++;
    const fund: Fund = {
        ...insertFund,
        id,
        createdAt: new Date(),
        status: "Locked",
        ipfsHash: null,
        proofDescription: null,
    };
    this.funds.set(id, fund);
    return fund;
  }

  async submitProof(id: number, proof: SubmitProofRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    // status must be "Pending Verification"
    const updated: Fund = { ...fund, ...proof, status: "Pending Verification" };
    this.funds.set(id, updated);
    return updated;
  }

  async verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    const updated: Fund = { ...fund, status: verification.status };
    this.funds.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
