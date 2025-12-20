import { Fund, InsertFund, SubmitProofRequest, VerifyFundRequest, User, InsertUser } from "@shared/schema";
import { UserModel } from "./models/User";
import { connectDB } from "./db";

export interface IStorage {
  // Users
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserWallet(id: string, walletAddress: string): Promise<User | undefined>;
  
  // Funds (In-Memory for metadata, real state should be on-chain)
  getFunds(role?: string, address?: string): Promise<Fund[]>;
  getFund(id: number): Promise<Fund | undefined>;
  createFund(fund: InsertFund): Promise<Fund>;
  submitProof(id: number, proof: SubmitProofRequest): Promise<Fund>;
  verifyFund(id: number, verification: VerifyFundRequest): Promise<Fund>;
}

export class MongoStorage implements IStorage {
  private funds: Map<number, Fund>;
  private users: Map<string, User>; // Fallback in-memory storage
  private currentFundId: number;
  private currentUserId: number; // For in-memory IDs
  private isMongoConnected: boolean;

  constructor() {
    this.funds = new Map();
    this.users = new Map();
    this.currentFundId = 1;
    this.currentUserId = 1;
    this.isMongoConnected = false;
    this.initDB();
  }

  private async initDB() {
    try {
       const connected = await connectDB();
       this.isMongoConnected = connected;
       if (!connected) {
         console.warn("Falling back to in-memory storage due to connection failure");
       }
    } catch (e) {
      console.warn("Falling back to in-memory storage due to error", e);
      this.isMongoConnected = false;
    }
  }

  private mapUser(doc: any): User {
    const obj = doc.toObject();
    return {
      ...obj,
      _id: obj._id.toString(),
      createdAt: obj.createdAt
    };
  }

  // User Implementation
  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    if (this.isMongoConnected) {
      const newUser = new UserModel(user);
      await newUser.save();
      return this.mapUser(newUser);
    }
    
    // Fallback
    const id = (this.currentUserId++).toString();
    const newUser: User = {
      ...user,
      _id: id,
      role: user.role as "Beneficiary" | "Funder" | "Verifier", // Type assertion for fallback
      about: user.about || undefined,
      walletAddress: undefined,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUser(id: string): Promise<User | undefined> {
    if (!id) return undefined;
    if (this.isMongoConnected) {
      try {
          const user = await UserModel.findById(id);
          return user ? this.mapUser(user) : undefined;
      } catch (e) {
          return undefined;
      }
    }
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.isMongoConnected) {
      const user = await UserModel.findOne({ email });
      return user ? this.mapUser(user) : undefined;
    }
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  
  async updateUserWallet(id: string, walletAddress: string): Promise<User | undefined> {
     if (this.isMongoConnected) {
       const user = await UserModel.findByIdAndUpdate(id, { walletAddress }, { new: true });
       return user ? this.mapUser(user) : undefined;
     }
     const user = this.users.get(id);
     if (user) {
       const updated = { ...user, walletAddress };
       this.users.set(id, updated);
       return updated;
     }
     return undefined;
  }

  // Fund Implementation
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
    const id = this.currentFundId++;
    const fund: Fund = { 
        ...insertFund, 
        id, 
        createdAt: new Date(), 
        status: "Locked", 
        ipfsHash: null, 
        proofDescription: null, 
        requiredDocuments: null, 
        submittedDocuments: null 
    };
    this.funds.set(id, fund);
    return fund;
  }

  async submitProof(id: number, proof: SubmitProofRequest): Promise<Fund> {
    const fund = this.funds.get(id);
    if (!fund) throw new Error("Fund not found");
    const updated: Fund = { 
        ...fund, 
        ...proof, 
        submittedDocuments: proof.submittedDocuments ? JSON.stringify(proof.submittedDocuments) : null,
        status: "Pending Verification" 
    };
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

export const storage = new MongoStorage();
