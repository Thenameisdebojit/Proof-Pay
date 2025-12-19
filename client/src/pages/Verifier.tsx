import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useFunds } from "@/hooks/use-funds";
import { FundCard } from "@/components/FundCard";
import { useSoroban, TxStatus } from "@/hooks/use-soroban";
import { useWallet } from "@/context/WalletContext";
import { AIVerificationPanel } from "@/components/AIVerificationPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionSuccess } from "@/components/TransactionSuccess";

export default function Verifier() {
  const { address } = useWallet();
  const { data: funds, isLoading: isFundsLoading } = useFunds({ role: "Verifier", address: address || "" });
  const { approveProof, refundFunder, isLoading: isTxLoading, txStatus } = useSoroban();
  const { toast } = useToast();
  
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [aiVerified, setAiVerified] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const getStatusMessage = (status: TxStatus) => {
    switch (status) {
      case 'simulating': return "Simulating...";
      case 'signing': return "Sign in Wallet...";
      case 'submitting': return "Submitting...";
      case 'polling': return "Confirming...";
      case 'success': return "Success!";
      case 'error': return "Failed";
      default: return "Approve & Sign";
    }
  };

  const pendingFunds = funds?.filter(f => f.status === "Pending Verification") || [];
  const processedFunds = funds?.filter(f => f.status !== "Pending Verification" && f.status !== "Locked") || [];

  const handleApprove = async () => {
    if (!selectedFund) return;
    if (!aiVerified) {
        toast({ title: "Verification Required", description: "Please run AI verification first (advisory).", variant: "destructive" });
        return;
    }
    
    const result = await approveProof(selectedFund.id);
    setSelectedFund(null);
    setAiVerified(false);
    if (result?.hash) setLastTxHash(result.hash);
  };

  const handleReject = async () => {
    if (!selectedFund) return;
    // Refund funder is equivalent to rejection in this flow context
    const result = await refundFunder(selectedFund.id);
    setSelectedFund(null);
    setAiVerified(false);
    if (result?.hash) setLastTxHash(result.hash);
  };

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-display font-bold">Verification Dashboard</h1>
        <p className="text-muted-foreground">Review proofs and authorize fund releases.</p>
      </div>

      {lastTxHash && (
        <div className="mb-8">
          <TransactionSuccess hash={lastTxHash} onDismiss={() => setLastTxHash(null)} />
        </div>
      )}

      <div className="space-y-8">
        {/* Pending Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">Pending Review</h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingFunds.length}
            </span>
          </div>
          
          {isFundsLoading ? (
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
                  onAction={() => {
                      setSelectedFund(fund);
                      setAiVerified(false);
                  }}
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

      <Dialog open={!!selectedFund} onOpenChange={(open) => !open && setSelectedFund(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Proof Submission</DialogTitle>
            <DialogDescription>
              Fund ID: #{selectedFund?.id} • Amount: {selectedFund?.amount} XLM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-slate-100 rounded-md">
                <h4 className="font-semibold text-sm mb-2">Proof Evidence</h4>
                <p className="text-sm text-slate-700 font-mono break-all">{selectedFund?.proofHash}</p>
                <p className="text-xs text-muted-foreground mt-2">
                    (In production, this would resolve to an IPFS document)
                </p>
            </div>

            <AIVerificationPanel onVerificationComplete={setAiVerified} fundData={selectedFund} />

            <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-xs mb-4 px-1">
                   <span className="text-muted-foreground">Estimated Network Fee:</span>
                   <span className="font-mono text-amber-600 dark:text-amber-400">~0.0001 XLM</span>
                </div>
                
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleReject} disabled={isTxLoading}>
                        {isTxLoading ? getStatusMessage(txStatus) : "Reject (Refund Funder)"}
                    </Button>
                    <Button 
                        onClick={handleApprove} 
                        disabled={isTxLoading || !aiVerified}
                        className={aiVerified ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                        {isTxLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isTxLoading ? getStatusMessage(txStatus) : "Approve & Sign"}
                    </Button>
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
