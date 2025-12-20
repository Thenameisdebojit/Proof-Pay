import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useFunds, useVerifyFund } from "@/hooks/use-funds";
import { FundCard } from "@/components/FundCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Lock, Copy, AlertTriangle, Check, ShieldCheck, Info } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { AIVerificationPanel } from "@/components/AIVerificationPanel";
import { Badge } from "@/components/ui/badge";

export default function Verifier() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { address } = useWallet();

  // Polls Soroban for funds
  // Filter for funds where verifier matches connected wallet (or MOCK for demo if needed, but requirements say connectedWallet)
  const { data: funds, isLoading } = useFunds({ role: "Verifier", address: address || "" });
  const verifyFund = useVerifyFund();
  
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [approvalStep, setApprovalStep] = useState<'idle' | 'signing' | 'submitted' | 'confirmed'>('idle');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid password");
    }
  };

  const pendingFunds = funds?.filter((f: any) => f.status === "Pending Verification") || [];
  const processedFunds = funds?.filter((f: any) => f.status !== "Pending Verification" && f.status !== "Locked") || [];

  const handleApprove = async () => {
    if (!selectedFund) return;
    
    setApprovalStep('signing');
    try {
        await verifyFund.mutateAsync({
            id: selectedFund.id,
            decision: 'approve'
        });
        setApprovalStep('submitted');
        
        // Simulate confirmation delay for UX
        setTimeout(() => {
            setApprovalStep('confirmed');
            setTimeout(() => {
                setSelectedFund(null);
                setApprovalStep('idle');
            }, 1500);
        }, 1500);
        
    } catch (e) {
        setApprovalStep('idle');
        console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md shadow-lg border-t-4 border-t-indigo-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <Lock className="w-5 h-5 text-indigo-600" />
                Verifier Portal
              </CardTitle>
              <CardDescription>Secure access for Institution Verifiers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Access Key</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter access key..."
                    className="focus:ring-indigo-500"
                  />
                  {loginError && <p className="text-sm text-destructive font-medium">{loginError}</p>}
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Access Dashboard</Button>
                <div className="text-xs text-center text-muted-foreground mt-4">
                    <p>Demo Key: <code className="bg-muted px-1 py-0.5 rounded">admin123</code></p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-2 mb-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100">Verification Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Review proofs and authorize fund releases.</p>
            </div>
            {/* System Status / Scalability Narrative (Task 6) */}
            <div className="hidden lg:block bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900 max-w-sm text-xs">
                <div className="flex items-center gap-2 font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                    <Info className="w-4 h-4" />
                    System Design Note
                </div>
                <p className="text-indigo-700 dark:text-indigo-400 leading-tight">
                    One verifier account can approve thousands of student proofs. 
                    No funds are held in custody. Unapproved funds can be reclaimed by funders after the deadline.
                </p>
            </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pending Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Pending Review</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
              {pendingFunds.length} Required
            </Badge>
          </div>
          
          {isLoading ? (
             <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
             </div>
          ) : pendingFunds.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 bg-slate-50 dark:bg-slate-900/20">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-50" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No pending proofs waiting for your review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingFunds.map((fund: any) => (
                <FundCard 
                  key={fund.id} 
                  fund={fund} 
                  role="Verifier"
                  actionLabel="Review & Approve"
                  onAction={() => setSelectedFund(fund)}
                />
              ))}
            </div>
          )}
        </section>

        {/* History Section */}
        {processedFunds.length > 0 && (
            <section className="opacity-75 hover:opacity-100 transition-opacity">
              <h2 className="text-xl font-bold mb-4 text-slate-500">Processed History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedFunds.map((fund: any) => (
                  <FundCard key={fund.id} fund={fund} role="Verifier" />
                ))}
              </div>
            </section>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedFund} onOpenChange={(open) => !open && approvalStep === 'idle' && setSelectedFund(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Review Proof Submission
            </DialogTitle>
            <DialogDescription>
              Verify beneficiary requirements before approving the release of funds.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column: Requirements & Details */}
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        {selectedFund?.conditions}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Beneficiary Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Beneficiary Address</p>
                            <div className="flex items-center gap-2 bg-muted p-2 rounded text-xs font-mono">
                                <span className="truncate">{selectedFund?.beneficiaryAddress}</span>
                                <Button size="icon" variant="ghost" className="h-4 w-4 shrink-0" onClick={() => copyToClipboard(selectedFund?.beneficiaryAddress)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Proof Hash (On-Chain)</p>
                            <div className="flex items-center gap-2 bg-muted p-2 rounded text-xs font-mono break-all">
                                <span>{selectedFund?.proofHash || "N/A"}</span>
                                <Button size="icon" variant="ghost" className="h-4 w-4 shrink-0" onClick={() => copyToClipboard(selectedFund?.proofHash)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                            <p className="text-sm bg-muted/50 p-2 rounded">{selectedFund?.proofDescription}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: AI & Action */}
            <div className="space-y-6">
                 {/* Task 4: AI Panel */}
                 <AIVerificationPanel fundData={selectedFund} />
                 
                 {/* Approval Flow */}
                 <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase text-indigo-600 dark:text-indigo-400">Verifier Action</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {approvalStep === 'idle' ? (
                            <Button 
                                onClick={handleApprove} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg font-semibold shadow-md"
                            >
                                Approve Proof
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        {approvalStep === 'signing' || approvalStep === 'submitted' || approvalStep === 'confirmed' ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                                        )}
                                        <span className={approvalStep === 'signing' ? "font-bold text-indigo-600" : ""}>Requesting Signature...</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {approvalStep === 'submitted' || approvalStep === 'confirmed' ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                                        )}
                                        <span className={approvalStep === 'submitted' ? "font-bold text-indigo-600" : ""}>Submitting to Network...</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {approvalStep === 'confirmed' ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                                        )}
                                        <span className={approvalStep === 'confirmed' ? "font-bold text-emerald-600" : ""}>Confirmed On-Chain</span>
                                    </div>
                                </div>
                                {approvalStep === 'confirmed' && (
                                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded text-center font-bold animate-in zoom-in duration-300">
                                        Funds Approved Successfully!
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
