import { db } from "./db";
import {
  funds,
  type Fund,
  type InsertFund,
  type SubmitProofRequest,
  type VerifyFundRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getFunds(role?: string, address?: string): Promise<Fund[]>;
  getFund(id: number): Promise<Fund | undefined>;
  createFund(fund: InsertFund): Promise<Fund>;
  submitProof(id: number, proof: SubmitProofRequest): Promise<Fund>;
  verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund>;
}

export class DatabaseStorage implements IStorage {
  async getFunds(role?: string, address?: string): Promise<Fund[]> {
    if (!db) throw new Error("Database not initialized");
    let query = db.select().from(funds).orderBy(desc(funds.createdAt));
    
    if (role && address) {
      if (role === 'Funder') {
        query = db.select().from(funds).where(eq(funds.funderAddress, address)).orderBy(desc(funds.createdAt));
      } else if (role === 'Beneficiary') {
        query = db.select().from(funds).where(eq(funds.beneficiaryAddress, address)).orderBy(desc(funds.createdAt));
      } else if (role === 'Verifier') {
        // Verifier sees funds assigned to them or pending ones?
        // Requirement: "List: 'Pending Verifications' table." implies filtering by status and verifier address
        // But for simplicity, let's just show all for verifier or filter by verifier address
        query = db.select().from(funds).where(eq(funds.verifierAddress, address)).orderBy(desc(funds.createdAt));
      }
    }
    
    return await query;
  }

  async getFund(id: number): Promise<Fund | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [fund] = await db.select().from(funds).where(eq(funds.id, id));
    return fund;
  }

  async createFund(insertFund: InsertFund): Promise<Fund> {
    if (!db) throw new Error("Database not initialized");
    const [fund] = await db.insert(funds).values(insertFund).returning();
    return fund;
  }

  async submitProof(id: number, proof: SubmitProofRequest): Promise<Fund> {
    if (!db) throw new Error("Database not initialized");
    const [updated] = await db
      .update(funds)
      .set({
        ipfsHash: proof.ipfsHash,
        proofDescription: proof.proofDescription,
        status: "Pending Verification"
      })
      .where(eq(funds.id, id))
      .returning();
    return updated;
  }

  async verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund> {
    if (!db) throw new Error("Database not initialized");
    const [updated] = await db
      .update(funds)
      .set({
        status: verification.status
      })
      .where(eq(funds.id, id))
      .returning();
    return updated;
  }
}

export class MemStorage implements IStorage {
  private funds: Map<number, Fund>;
  private currentId: number;

  constructor() {
    this.funds = new Map();
    this.currentId = 1;
  }

  async getFunds(role?: string, address?: string): Promise<Fund[]> {
    let allFunds = Array.from(this.funds.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );

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
      requiredDocuments: insertFund.requiredDocuments || null,
      submittedDocuments: null,
    };
    this.funds.set(id, fund);
    return fund;
  }

  async submitProof(id: number, proof: SubmitProofRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    const updated: Fund = { 
      ...fund, 
      ipfsHash: proof.ipfsHash || null,
      proofDescription: proof.proofDescription,
      submittedDocuments: proof.submittedDocuments ? JSON.stringify(proof.submittedDocuments) : null,
      status: "Pending Verification" 
    };
    this.funds.set(id, updated);
    return updated;
  }

  async verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    const updated = { ...fund, status: verification.status };
    this.funds.set(id, updated);
    return updated;
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();
