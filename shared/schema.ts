import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  funderAddress: text("funder_address").notNull(),
  beneficiaryAddress: text("beneficiary_address").notNull(),
  verifierAddress: text("verifier_address").notNull(),
  amount: text("amount").notNull(),
  conditions: text("conditions").notNull(),
  deadline: text("deadline").notNull(),
  status: text("status").notNull().default("Locked"), // Locked, Pending Verification, Approved, Released, Rejected
  ipfsHash: text("ipfs_hash"),
  proofDescription: text("proof_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFundSchema = createInsertSchema(funds).omit({
  id: true,
  createdAt: true,
  status: true,
  ipfsHash: true,
  proofDescription: true,
});

export const submitProofSchema = z.object({
  ipfsHash: z.string().min(1, "IPFS Hash is required"),
  proofDescription: z.string().min(1, "Description is required"),
});

export const verifyFundSchema = z.object({
  status: z.enum(["Approved", "Rejected", "Released"]),
});

export type Fund = typeof funds.$inferSelect;
export type InsertFund = z.infer<typeof insertFundSchema>;
export type SubmitProofRequest = z.infer<typeof submitProofSchema>;
export type VerifyFundRequest = z.infer<typeof verifyFundSchema>;
