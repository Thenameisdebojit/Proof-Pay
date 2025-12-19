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
    const [fund] = await db.select().from(funds).where(eq(funds.id, id));
    return fund;
  }

  async createFund(insertFund: InsertFund): Promise<Fund> {
    const [fund] = await db.insert(funds).values(insertFund).returning();
    return fund;
  }

  async submitProof(id: number, proof: SubmitProofRequest): Promise<Fund> {
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

export const storage = new DatabaseStorage();
