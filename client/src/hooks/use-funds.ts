import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { Fund } from "@shared/schema";

// Fetch list of funds
export function useFunds(filters?: { role?: 'Funder' | 'Beneficiary' | 'Verifier', address?: string }) {
  return useQuery({
    queryKey: ['funds', filters],
    queryFn: async () => {
      let url = `${api.funds.list.path}?`;
      if (filters?.role) {
        url += `role=${filters.role}&`;
      }
      // For Beneficiary and Verifier, we intentionally omit the address filter to ensure they see all funds 
      // (resolves "doesn't show fund" issue if wallet address mismatches or is empty during demo)
      // For Funder, we keep the filter to show only their created funds
      if (filters?.address && filters.role !== 'Beneficiary' && filters.role !== 'Verifier') {
        url += `address=${filters.address}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch funds");
      return res.json() as Promise<Fund[]>;
    },
    // Poll every 2 seconds for faster updates during demo
    refetchInterval: 2000, 
  });
}

// Fetch single fund details
export function useFund(id: number) {
  return useQuery({
    queryKey: ['fund', id],
    queryFn: async () => {
      const res = await fetch(api.funds.get.path.replace(':id', id.toString()));
      if (!res.ok) throw new Error("Failed to fetch fund");
      return res.json() as Promise<Fund>;
    },
    refetchInterval: 2000,
  });
}

// Create a new fund (Donor)
export function useCreateFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.funds.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create fund");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      toast({
        title: "Fund Created",
        description: "Your scholarship fund has been successfully created.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

// Submit Proof (Beneficiary)
export function useSubmitProof() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, proofHash, proofDescription, submittedDocuments }: { id: number, proofHash: string, proofDescription?: string, submittedDocuments?: any }) => {
      const res = await fetch(api.funds.submitProof.path.replace(':id', id.toString()), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipfsHash: proofHash, // Using proofHash as ipfsHash for now
          proofDescription: proofDescription || "Proof submitted",
          submittedDocuments
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit proof");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['fund'] });
      toast({
        title: "Proof Submitted",
        description: "Your proof has been submitted for verification.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

// Verify Fund (Verifier) - Now supports direct status update
export function useVerifyFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, decision, status }: { id: number, decision?: 'approve' | 'reject', status?: 'Approved' | 'Released' | 'Rejected' }) => {
      // Determine status based on decision or explicit status
      let finalStatus = status;
      if (!finalStatus && decision) {
        finalStatus = decision === 'approve' ? 'Approved' : 'Rejected';
      }

      if (!finalStatus) throw new Error("Status or decision required");

      const res = await fetch(api.funds.verify.path.replace(':id', id.toString()), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: finalStatus }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to verify fund");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['fund'] });
      
      const status = variables.status || (variables.decision === 'approve' ? 'Approved' : 'Rejected');
      
      toast({
        title: status === 'Released' ? "Fund Released" : "Decision Recorded",
        description: status === 'Released' 
          ? "Funds have been transferred to the beneficiary." 
          : "Fund status updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

// Claim Funds (Beneficiary)
export function useClaimFunds() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: async (id: number) => {
        // We reuse the verify endpoint to set status to Released
        const res = await fetch(api.funds.verify.path.replace(':id', id.toString()), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Released' }),
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to claim funds");
        }
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['funds'] });
        queryClient.invalidateQueries({ queryKey: ['fund'] });
        toast({
          title: "Funds Claimed!",
          description: "Funds have been released to your account.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Claim Failed",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  }
