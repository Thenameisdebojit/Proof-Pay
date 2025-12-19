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
    let query: any = db.select().from(funds);
    
    if (role && address) {
      if (role === 'Funder') {
        query = query.where(eq(funds.funderAddress, address));
      } else if (role === 'Beneficiary') {
        query = query.where(eq(funds.beneficiaryAddress, address));
      } else if (role === 'Verifier') {
        query = query.where(eq(funds.verifierAddress, address));
      }
    }
    
    return await query.orderBy(desc(funds.createdAt));
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
    let allFunds = Array.from(this.funds.values());
    
    if (role && address) {
      if (role === 'Funder') {
        allFunds = allFunds.filter(f => f.funderAddress === address);
      } else if (role === 'Beneficiary') {
        allFunds = allFunds.filter(f => f.beneficiaryAddress === address);
      } else if (role === 'Verifier') {
        allFunds = allFunds.filter(f => f.verifierAddress === address);
      }
    }
    
    return allFunds.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  async getFund(id: number): Promise<Fund | undefined> {
    return this.funds.get(id);
  }

  async createFund(insertFund: InsertFund): Promise<Fund> {
    const id = this.currentId++;
    const fund: Fund = {
      ...insertFund,
      id,
      status: "Locked",
      ipfsHash: null,
      proofDescription: null,
      createdAt: new Date(),
    };
    this.funds.set(id, fund);
    return fund;
  }

  async submitProof(id: number, proof: SubmitProofRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    
    const updatedFund = {
      ...fund,
      ipfsHash: proof.ipfsHash,
      proofDescription: proof.proofDescription,
      status: "Pending Verification"
    };
    this.funds.set(id, updatedFund);
    return updatedFund;
  }

  async verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    
    const updatedFund = {
      ...fund,
      status: verification.status
    };
    this.funds.set(id, updatedFund);
    return updatedFund;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
