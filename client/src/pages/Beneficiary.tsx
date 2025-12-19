import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useFunds, useSubmitProof } from "@/hooks/use-funds";
import { useSoroban } from "@/hooks/use-soroban";
import { useWallet } from "@/context/WalletContext";
import { FundCard } from "@/components/FundCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { Fund } from "@shared/schema";

export default function Beneficiary() {
  const { address } = useWallet();
  const { data: funds, isLoading } = useFunds({ role: "Beneficiary", address: address || "" });
  const submitProofApi = useSubmitProof();
  const { submitProof: submitProofContract, isLoading: isContractLoading } = useSoroban();
  
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [description, setDescription] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund) return;

    try {
      // 1. Submit to Blockchain
      // For prototype, we use a dummy hash if ipfsHash is not 64 chars hex
      // In prod, this would be the actual hash of the file/metadata
      const proofHash = "b".repeat(64); 

      const txResult = await submitProofContract(selectedFund.id, proofHash);

      if (txResult?.status === 'success') {
         // 2. Update Backend
         submitProofApi.mutate({
          id: selectedFund.id,
          data: { proofDescription: description, ipfsHash }
        }, {
          onSuccess: () => {
            setSelectedFund(null);
            setDescription("");
            setIpfsHash("");
          }
        });
      }
    } catch (error) {
      console.error("Proof submission failed", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Scholarship Portal</h1>
        <p className="text-muted-foreground">Submit proofs to unlock your conditional funds.</p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : funds?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <h3 className="font-display font-medium text-lg">No active scholarships</h3>
          <p className="text-muted-foreground mt-2">You haven't been assigned any funds yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds?.map((fund) => (
            <FundCard 
              key={fund.id} 
              fund={fund} 
              role="Beneficiary" 
              actionLabel={fund.status === "Locked" ? "Submit Proof" : undefined}
              onAction={fund.status === "Locked" ? () => setSelectedFund(fund) : undefined}
            />
          ))}
        </div>
      )}

      {/* Proof Submission Modal */}
      <Dialog open={!!selectedFund} onOpenChange={(open) => !open && setSelectedFund(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Verification Proof</DialogTitle>
            <DialogDescription>
              Provide evidence that you've met the conditions: <br/>
              <span className="font-medium text-foreground italic">"{selectedFund?.conditions}"</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea 
                id="desc"
                placeholder="I have completed the semester with a 3.5 GPA..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ipfs">IPFS Hash (Document)</Label>
              <div className="relative">
                <UploadCloud className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="ipfs"
                  placeholder="QmHash..."
                  className="pl-9 font-mono text-sm"
                  value={ipfsHash}
                  onChange={(e) => setIpfsHash(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                In production, you would upload a file directly to IPFS here.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setSelectedFund(null)}>Cancel</Button>
              <Button type="submit" disabled={isContractLoading || submitProofApi.isPending}>
                {isContractLoading || submitProofApi.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
