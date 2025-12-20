import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function mapContractError(error: any): string {
    const msg = error?.message || error?.toString() || "Unknown error";
    
    if (msg.includes("Deadline expired")) return "❌ Proof cannot be submitted. Reason: Deadline expired on-chain.";
    if (msg.includes("Invalid signature")) return "❌ Transaction rejected. Reason: Invalid wallet signature.";
    if (msg.includes("Insufficient balance")) return "❌ Transaction failed. Reason: Insufficient balance for fees.";
    if (msg.includes("Demo Failure")) return "❌ Demo Mode Error: Simulated failure triggered.";
    if (msg.includes("Wrong wallet")) return "❌ Access Denied. Reason: Wallet does not match authorized beneficiary.";
    
    return `❌ Transaction Error: ${msg}`;
}
