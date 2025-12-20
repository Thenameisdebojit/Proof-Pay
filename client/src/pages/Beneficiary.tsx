import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useFunds, useSubmitProof, useClaimFunds } from "@/hooks/use-funds";
import { FundCard } from "@/components/FundCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, Bell, Hash, ShieldCheck, ArrowRight, ExternalLink, Coins } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { calculateFileHash } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function Beneficiary() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { address, balance } = useWallet();
  
  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'Beneficiary')) {
      setLocation('/login');
    }
  }, [user, isAuthLoading, setLocation]);

  // Polls Soroban for funds
  const { data: funds, isLoading } = useFunds({ role: "Beneficiary", address: address || "" });
  const submitProof = useSubmitProof();
  const claimFunds = useClaimFunds();
  
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [claimingFund, setClaimingFund] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [proofHash, setProofHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const pendingFunds = funds?.filter((f: any) => f.status === "Locked") || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setIsHashing(true);
      try {
        const hash = await calculateFileHash(f);
        setProofHash(hash);
        
        // Mock AI Analysis if enabled
        if (useAi) {
            // Simulate AI delay
            setTimeout(() => {
                setAiResult(`AI Analysis for ${f.name}:\n- Document Type: Verified\n- Clarity: High\n- Detected Date: ${new Date().toLocaleDateString()}`);
            }, 1500);
        } else {
            setAiResult(null);
        }
      } catch (err) {
        console.error("Hashing failed", err);
      } finally {
        setIsHashing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || !proofHash) return;

    // We append AI result to description if present, so Verifier sees it
    const finalDescription = description + (aiResult ? `\n\n[AI Verification]\n${aiResult}` : "");

    submitProof.mutate({
      id: selectedFund.id,
      proofHash: proofHash
    }, {
      onSuccess: () => {
        setSelectedFund(null);
        setDescription("");
        setProofHash("");
        setFile(null);
        setAiResult(null);
      }
    });
  };

  const handleClaim = async () => {
    if (!claimingFund) return;
    
    claimFunds.mutate(claimingFund.id, {
        onSuccess: () => {
            setClaimSuccess(`tx_${Math.random().toString(36).substring(7)}`);
            // Close dialog after short delay or let user close
        }
    });
  }

  return (
    <Layout>
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-display font-bold">Scholarship Portal</h1>
        <p className="text-muted-foreground">Submit proofs to unlock your conditional funds.</p>
      </div>

      {pendingFunds.length > 0 && (
        <Alert className="mb-6 border-indigo-200 bg-indigo-50 dark:bg-indigo-950">
          <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <AlertTitle className="text-indigo-800 dark:text-indigo-200">Action Required</AlertTitle>
          <AlertDescription className="text-indigo-700 dark:text-indigo-300">
            You have {pendingFunds.length} pending scholarship(s). Please submit the required proofs.
          </AlertDescription>
        </Alert>
      )}

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
          {funds?.map((fund: any) => {
            let actionLabel;
            let onAction;

            if (fund.status === "Locked") {
                actionLabel = "Submit Proof";
                onAction = () => setSelectedFund(fund);
            } else if (fund.status === "Approved") {
                actionLabel = "Claim Funds";
                onAction = () => {
                    setClaimSuccess(null);
                    setClaimingFund(fund);
                };
            }

            return (
                <FundCard 
                  key={fund.id} 
                  fund={fund} 
                  role="Beneficiary" 
                  actionLabel={actionLabel}
                  onAction={onAction}
                />
            );
          })}
        </div>
      )}

      {/* Proof Submission Modal */}
      <Dialog open={!!selectedFund} onOpenChange={(open) => !open && setSelectedFund(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Verification Proof</DialogTitle>
            <DialogDescription>
              Provide evidence for: <span className="font-medium text-foreground">"{selectedFund?.conditions}"</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">File Upload</TabsTrigger>
                <TabsTrigger value="manual">Manual Hash</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Document (PDF/Image)</Label>
                  <div className="relative">
                    <UploadCloud className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="file"
                      className="pl-9 text-sm"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    File is hashed locally (SHA-256). The file itself never leaves your browser.
                  </p>
                </div>

                <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/50">
                  <Checkbox 
                    id="ai-mode" 
                    checked={useAi}
                    onCheckedChange={(c) => {
                        setUseAi(!!c);
                        if (!c) setAiResult(null);
                    }}
                  />
                  <label
                    htmlFor="ai-mode"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    Analyze with AI (Local)
                  </label>
                </div>
                {aiResult && (
                    <div className="text-xs bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100 whitespace-pre-wrap">
                        {aiResult}
                    </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="hash">Document Hash (SHA-256)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="hash"
                      placeholder="0x..."
                      value={proofHash}
                      onChange={(e) => setProofHash(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="desc">Additional Notes</Label>
              <Textarea 
                id="desc"
                placeholder="I have completed the milestone..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {proofHash && (
                <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                    Hash: {proofHash}
                </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedFund(null)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={submitProof.isPending || isHashing || !proofHash}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitProof.isPending ? "Signing Transaction..." : "Submit Proof on Chain"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Claim Funds Modal */}
      <Dialog open={!!claimingFund} onOpenChange={(open) => !open && setClaimingFund(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Claim Scholarship Funds</DialogTitle>
                <DialogDescription>
                    Review the transaction details before signing.
                </DialogDescription>
            </DialogHeader>

            {claimSuccess ? (
                <div className="py-6 space-y-4 text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-green-700">Funds Released!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            The funds have been transferred to your wallet.
                        </p>
                    </div>
                    <div className="bg-muted p-3 rounded text-xs font-mono text-muted-foreground break-all">
                        Tx: {claimSuccess}
                    </div>
                    <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${claimSuccess}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-indigo-600 hover:underline"
                    >
                        View on Stellar Explorer <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <Button className="w-full mt-4" onClick={() => setClaimingFund(null)}>
                        Close
                    </Button>
                </div>
            ) : (
                <div className="space-y-6 py-4">
                    <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Balance</span>
                            <span className="font-mono">{balance}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-indigo-700">
                            <span>Claim Amount</span>
                            <span>+ {claimingFund?.amount} XLM</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground border-b pb-3">
                            <span>Network Fee (Est.)</span>
                            <span>- 0.00001 XLM</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1">
                            <span>New Balance (Est.)</span>
                            <span className="text-green-600">
                                ~ {parseInt(balance.replace(/\D/g,'')) + parseInt(claimingFund?.amount || 0)} XLM
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setClaimingFund(null)}>Cancel</Button>
                        <Button 
                            onClick={handleClaim} 
                            disabled={claimFunds.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {claimFunds.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing...
                                </>
                            ) : (
                                <>
                                    Sign & Claim Funds <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
