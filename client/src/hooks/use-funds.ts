import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertFund, type SubmitProofRequest, type VerifyFundRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch list of funds, optionally filtered
export function useFunds(filters?: { role?: 'Funder' | 'Beneficiary' | 'Verifier', address?: string }) {
  const queryKey = filters ? [api.funds.list.path, filters] : [api.funds.list.path];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters?.role) params.append("role", filters.role);
      if (filters?.address) params.append("address", filters.address);
      
      const url = `${api.funds.list.path}?${params.toString()}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch funds");
      return api.funds.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single fund details
export function useFund(id: number) {
  return useQuery({
    queryKey: [api.funds.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.funds.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch fund details");
      return api.funds.get.responses[200].parse(await res.json());
    },
  });
}

// Create a new fund
export function useCreateFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertFund) => {
      const res = await fetch(api.funds.create.path, {
        method: api.funds.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.funds.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create fund");
      }
      return api.funds.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.funds.list.path] });
      toast({
        title: "Fund Created",
        description: "Your scholarship fund has been successfully locked on the network.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
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
    mutationFn: async ({ id, data }: { id: number, data: SubmitProofRequest }) => {
      const url = buildUrl(api.funds.submitProof.path, { id });
      const res = await fetch(url, {
        method: api.funds.submitProof.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to submit proof");
      return api.funds.submitProof.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.funds.list.path] });
      toast({
        title: "Proof Submitted",
        description: "Your proof has been sent to the verifier for review.",
      });
    },
    onError: (err) => {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

// Verify Fund (Verifier)
export function useVerifyFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: VerifyFundRequest }) => {
      const url = buildUrl(api.funds.verify.path, { id });
      const res = await fetch(url, {
        method: api.funds.verify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to verify fund");
      return api.funds.verify.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.funds.list.path] });
      const action = data.status === "Approved" || data.status === "Released" ? "approved" : "rejected";
      toast({
        title: "Verification Complete",
        description: `Fund has been ${action}.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
