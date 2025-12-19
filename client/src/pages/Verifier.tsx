import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useFunds, useVerifyFund } from "@/hooks/use-funds";
import { useSoroban } from "@/hooks/use-soroban";
import { useWallet } from "@/context/WalletContext";
import { FundCard } from "@/components/FundCard";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Fund } from "@shared/schema";

export default function Verifier() {
  const { address } = useWallet();
  const { data: funds, isLoading } = useFunds({ role: "Verifier", address: address || "" });
  const verifyFund = useVerifyFund();
  const { approveProof, refundFunder, isLoading: isContractLoading } = useSoroban();
  
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'signing' | 'submitting'>('idle');

  // Filter only funds that need attention
  const pendingFunds = funds?.filter(f => f.status === "Pending Verification") || [];
  const processedFunds = funds?.filter(f => f.status !== "Pending Verification" && f.status !== "Locked") || [];

  const handleDecision = async (decision: 'Approved' | 'Rejected') => {
    if (!selectedFund) return;
    
    setProcessingState('signing');
    
    try {
      if (decision === 'Approved') {
        const txResult = await approveProof(selectedFund.id);
        if (txResult?.status !== 'success') {
          setProcessingState('idle');
          return;
        }
      } else if (decision === 'Rejected') {
        const txResult = await refundFunder(selectedFund.id);
        if (txResult?.status !== 'success') {
          setProcessingState('idle');
          return;
        }
      }

      setProcessingState('submitting');
      
      verifyFund.mutate({
        id: selectedFund.id,
        data: { status: decision }
      }, {
        onSuccess: () => {
          setSelectedFund(null);
          setProcessingState('idle');
        },
        onError: () => {
          setProcessingState('idle');
        }
      });
    } catch (e) {
      console.error("Verification failed", e);
      setProcessingState('idle');
    }
  };

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-display font-bold">Verification Dashboard</h1>
        <p className="text-muted-foreground">Review proofs and authorize fund releases.</p>
      </div>

      <div className="space-y-8">
        {/* Pending Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">Pending Review</h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingFunds.length}
            </span>
          </div>
          
          {isLoading ? (
             <Loader2 className="animate-spin text-primary" />
          ) : pendingFunds.length === 0 ? (
            <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
              No pending proofs to review.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingFunds.map((fund) => (
                <FundCard 
                  key={fund.id} 
                  fund={fund} 
                  role="Verifier"
                  actionLabel="Review Proof"
                  onAction={() => setSelectedFund(fund)}
                />
              ))}
            </div>
          )}
        </section>

        {/* History Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-muted-foreground">Processed History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
            {processedFunds.map((fund) => (
              <FundCard key={fund.id} fund={fund} role="Verifier" />
            ))}
          </div>
        </section>
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedFund} onOpenChange={(open) => !open && setSelectedFund(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Proof Submission</DialogTitle>
            <DialogDescription>
              Verify if the beneficiary has met the required conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-semibold text-muted-foreground text-xs uppercase">Conditions</p>
              <p>{selectedFund?.conditions}</p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg text-sm border border-indigo-100 dark:border-indigo-900 space-y-2">
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs uppercase">Beneficiary Proof</p>
              <p className="italic">"{selectedFund?.proofDescription}"</p>
              {selectedFund?.ipfsHash && (
                <div className="pt-2">
                  <a href="#" className="text-xs text-primary underline">View Attached Documents (IPFS)</a>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => handleDecision("Rejected")}
              disabled={processingState !== 'idle'}
            >
              {processingState !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleDecision("Approved")}
              disabled={processingState !== 'idle'}
            >
              {processingState !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve & Release Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
