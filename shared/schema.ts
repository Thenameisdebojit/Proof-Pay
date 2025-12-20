import { z } from "zod";

export const userRoleSchema = z.enum(["Beneficiary", "Funder", "Verifier"]);

export const userSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  passwordHash: z.string().optional(), // Internal use
  role: userRoleSchema,
  about: z.string().optional(),
  walletAddress: z.string().optional(),
  createdAt: z.date().optional(),
});

export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: userRoleSchema,
  about: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Fund Schema (Pure Zod now)
export const fundSchema = z.object({
  id: z.number(),
  funderAddress: z.string(),
  beneficiaryAddress: z.string(),
  verifierAddress: z.string(),
  amount: z.string(),
  conditions: z.string(),
  deadline: z.string(),
  status: z.string().default("Locked"),
  ipfsHash: z.string().optional().nullable(),
  proofDescription: z.string().optional().nullable(),
  requiredDocuments: z.string().optional().nullable(),
  submittedDocuments: z.string().optional().nullable(),
  createdAt: z.date().optional(),
});

export const insertFundSchema = fundSchema.omit({
  id: true,
  createdAt: true,
  status: true,
  ipfsHash: true,
  proofDescription: true,
  submittedDocuments: true,
});

export const submitProofSchema = z.object({
  ipfsHash: z.string().optional(),
  proofDescription: z.string().min(1, "Description is required"),
  submittedDocuments: z.record(z.string()).optional(),
});

export const verifyFundSchema = z.object({
  status: z.enum(["Approved", "Rejected", "Released"]),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Fund = z.infer<typeof fundSchema>;
export type InsertFund = z.infer<typeof insertFundSchema>;
export type SubmitProofRequest = z.infer<typeof submitProofSchema>;
export type VerifyFundRequest = z.infer<typeof verifyFundSchema>;
