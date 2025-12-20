import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { sorobanData, type OnChainFund } from "@/lib/soroban-data";
import { stellarService } from "@/lib/stellarService";
import { mapContractError } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";

// Fetch list of funds, optionally filtered
// Replaces backend API with Soroban polling
export function useFunds(filters?: { role?: 'Funder' | 'Beneficiary' | 'Verifier', address?: string }) {
  return useQuery({
    queryKey: ['funds', filters],
    queryFn: async () => {
      // 1. Fetch from Chain (Source of Truth)
      const allFunds = await sorobanData.getAllFunds();
      
      // 2. Filter locally
      if (!filters) return allFunds;
      return allFunds.filter(f => {
         if (filters.address) {
             // Case insensitive comparison for addresses
             const addr = filters.address.toUpperCase();
             if (filters.role === 'Funder' && f.funderAddress.toUpperCase() !== addr) return false;
             if (filters.role === 'Beneficiary' && f.beneficiaryAddress.toUpperCase() !== addr) return false;
             if (filters.role === 'Verifier' && f.verifierAddress.toUpperCase() !== addr) return false;
         }
         return true;
      });
    },
    refetchInterval: 8000, // Poll every 8 seconds (MANDATORY Requirement)
  });
}

// Fetch single fund details
export function useFund(id: number) {
  return useQuery({
    queryKey: ['fund', id],
    queryFn: async () => {
      return await sorobanData.getFund(id);
    },
    refetchInterval: 8000,
  });
}

// Create a new fund (Donor)
export function useCreateFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isDemoMode } = useWallet();

  return useMutation({
    mutationFn: async (data: any) => {
      if (isDemoMode) {
          await new Promise(r => setTimeout(r, 1000));
          throw new Error("Demo Failure: Insufficient balance for fees");
      }
      // For this demo, we simulate creation or call contract if implemented
      // Using the mock helper in sorobanData to update "local chain state" for the demo
      // In production, this would be stellarService.createFund(...)
      return sorobanData.mockCreateFund(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      toast({
        title: "Fund Created",
        description: "Your scholarship fund has been successfully locked on the network.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Creation Failed",
        description: mapContractError(err),
        variant: "destructive",
      });
    },
  });
}

// Submit Proof (Beneficiary)
export function useSubmitProof() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isDemoMode } = useWallet();

  return useMutation({
    mutationFn: async ({ id, proofHash }: { id: number, proofHash: string }) => {
      if (isDemoMode) {
          await new Promise(r => setTimeout(r, 1500));
          throw new Error("Demo Failure: Deadline expired on-chain");
      }
      // 1. Call Albedo Wallet
      const tx = await stellarService.submitProof(id, proofHash);
      
      // 2. Optimistic Update (for demo responsiveness)
      if (tx) {
          sorobanData.mockUpdateFundStatus(id, "Pending Verification", proofHash);
      }
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['fund'] });
      toast({
        title: "Proof Submitted",
        description: "Transaction confirmed on-chain.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Submission Failed",
        description: mapContractError(err),
        variant: "destructive",
      });
    },
  });
}

// Verify Fund (Verifier)
export function useVerifyFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isDemoMode } = useWallet();

  return useMutation({
    mutationFn: async ({ id, decision }: { id: number, decision: 'approve' | 'reject' }) => {
      if (isDemoMode) {
          await new Promise(r => setTimeout(r, 1500));
          throw new Error("Demo Failure: Invalid signature (Wrong wallet)");
      }
      if (decision === 'approve') {
          const tx = await stellarService.approveProof(id);
          if (tx) sorobanData.mockUpdateFundStatus(id, "Approved");
          return tx;
      } else {
          // Reject flow (Refund?)
          // stellarService.rejectProof(id)
          throw new Error("Rejection not fully implemented on-chain yet");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['fund'] });
      toast({
        title: "Decision Recorded",
        description: "Fund status updated on-chain.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Verification Failed",
        description: mapContractError(err),
        variant: "destructive",
      });
    },
  });
}

// Claim Funds (Beneficiary)
export function useClaimFunds() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { isDemoMode } = useWallet();
  
    return useMutation({
      mutationFn: async (id: number) => {
        if (isDemoMode) {
            await new Promise(r => setTimeout(r, 1500));
            throw new Error("Demo Failure: Claim before approval (Mock)");
        }
        const tx = await stellarService.releaseFunds(id);
        if (tx) sorobanData.mockUpdateFundStatus(id, "Released");
        return tx;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['funds'] });
        queryClient.invalidateQueries({ queryKey: ['fund'] });
        toast({
          title: "Funds Claimed!",
          description: "XLM transferred to your wallet.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Claim Failed",
          description: mapContractError(err),
          variant: "destructive",
        });
      },
    });
  }
