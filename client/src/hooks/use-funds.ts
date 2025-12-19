import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sorobanData } from "@/lib/soroban-data";
import { useSoroban } from "@/hooks/use-soroban";
import { useToast } from "@/hooks/use-toast";
import { insertFundSchema } from "@shared/schema";
import { z } from "zod";

export function useFunds(filters?: { role?: 'Funder' | 'Beneficiary' | 'Verifier', address?: string }) {
  return useQuery({
    queryKey: ['funds', filters],
    queryFn: async () => {
      const allFunds = await sorobanData.getAllFunds();
      
      // Filter locally
      if (!filters) return allFunds;

      return allFunds.filter(fund => {
        if (!filters.address) return true;
        
        // Case-insensitive comparison
        const userAddr = filters.address.toLowerCase();
        const funder = fund.funderAddress.toLowerCase();
        const beneficiary = fund.beneficiaryAddress.toLowerCase();
        const verifier = fund.verifierAddress.toLowerCase();

        if (filters.role === 'Funder') {
            return funder === userAddr;
        }
        if (filters.role === 'Beneficiary') {
            return beneficiary === userAddr;
        }
        if (filters.role === 'Verifier') {
            return verifier === userAddr;
        }
        return true;
      });
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useCreateFund() {
  const { toast } = useToast();
  const soroban = useSoroban();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertFundSchema>) => {
      // 1. Create hash from conditions (simple mock hash for now)
      const requirementHash = "0".repeat(64); 

      // 2. Calculate deadline timestamp
      const deadlineTimestamp = Math.floor(new Date(data.deadline).getTime() / 1000);

      // 3. Call Soroban Contract
      const result = await soroban.createFund(
        data.beneficiaryAddress,
        data.verifierAddress,
        data.amount,
        deadlineTimestamp,
        requirementHash
      );

      // 4. Save Local Metadata
      // If we got an ID back (Demo Mode), use it. 
      // Otherwise fetch latest ID (Real Mode).
      let newFundId = (result as any)?.id;
      
      if (newFundId === undefined) {
         // In real mode, we assume the new fund is the last one created
         const nextId = await sorobanData.getNextFundId();
         newFundId = nextId > 0 ? nextId - 1 : 0;
      }
      
      sorobanData.saveLocalMetadata(
        newFundId,
        data.conditions,
        undefined, 
        undefined, 
        undefined  
      );

      return result;
    },
    onSuccess: () => {
      toast({ title: "Fund Created Successfully" });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create fund", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  return { ...mutation, txStatus: soroban.txStatus };
}

export function useReleaseFunds() {
  const { toast } = useToast();
  const soroban = useSoroban();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await soroban.releaseFunds(id);
      
      // Update local metadata if needed (optional for status change as it's on-chain)
      // But we can update the mock state or just invalidate queries
      if (result) {
         sorobanData.mockUpdateFundStatus(id, "Released");
      }
      return result;
    },
    onSuccess: () => {
      toast({ title: "Funds Released Successfully" });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to release funds", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  return { ...mutation, txStatus: soroban.txStatus };
}

export function useSubmitProof() {
  const { toast } = useToast();
  const soroban = useSoroban();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { proofDescription: string, ipfsHash: string } }) => {
      // 1. Create hash from IPFS hash (mock or real)
      const proofHash = data.ipfsHash.padEnd(64, '0').substring(0, 64);

      // 2. Call Soroban Contract
      const result = await soroban.submitProof(id, proofHash);

      // 3. Save Local Metadata (update existing)
      const existingMeta = sorobanData.getLocalMetadata(id);
      sorobanData.saveLocalMetadata(
        id,
        existingMeta.conditions,
        data.proofDescription,
        data.ipfsHash,
        existingMeta.feedbackStatus
      );

      return result;
    },
    onSuccess: () => {
      toast({ title: "Proof Submitted Successfully" });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit proof", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  return { ...mutation, txStatus: soroban.txStatus };
}
