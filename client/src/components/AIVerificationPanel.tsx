import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertTriangle, FileText, CheckCircle2, Search, FileCheck, School } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AIVerificationPanelProps {
  onVerificationComplete?: (isValid: boolean) => void;
  fundData?: any;
}

export function AIVerificationPanel({ onVerificationComplete, fundData }: AIVerificationPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [consent, setConsent] = useState(false);

  const handleAnalyze = () => {
    if (!consent) return;
    setAnalyzing(true);
    setProgress(0);
    
    // Animate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate AI Analysis
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Logic: If description is very short (< 10 chars), simulate low confidence
      const isLowConfidence = fundData?.proofDescription && fundData.proofDescription.length < 10;
      
      setResult({
        studentName: fundData?.beneficiaryAddress ? `Student ${fundData.beneficiaryAddress.substring(0, 4)}...` : "Jane Doe",
        institution: "Detected: Standard Transcript Format",
        gpa: "3.8/4.0",
        confidence: isLowConfidence ? 45 : 82,
        status: isLowConfidence ? "potential_mismatch" : "likely_match",
        checks: [
          { label: "Digital Signature Valid", passed: true },
          { label: "Institution Authenticity", passed: !isLowConfidence },
          { label: "Transcript Date Range", passed: true },
          { label: "Course Requirement Match", passed: !isLowConfidence }
        ],
        explanation: isLowConfidence 
            ? "Proof description is too brief. Document structure unclear." 
            : "Document structure matches standard transcript format. Name and Institution align with fund requirements."
      });
      setAnalyzing(false);
      // Advisory only - we always allow "complete" but maybe the parent decides what to do
      if (onVerificationComplete) onVerificationComplete(true);
    }, 2500);
  };

  return (
    <div className="space-y-4 border rounded-xl p-5 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          AI Advisory Verification
        </h3>
        <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold bg-background">Advisory Only</Badge>
      </div>

      <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-xs">
         <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
         <AlertTitle className="text-amber-800 dark:text-amber-400 font-bold mb-1">Important Disclaimer</AlertTitle>
         <AlertDescription className="text-amber-700 dark:text-amber-300">
            AI does NOT approve funds. Only your wallet signature triggers payment. This tool provides advisory analysis only.
         </AlertDescription>
      </Alert>

      {!result ? (
        <div className="text-center py-6">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            Upload document for local AI analysis. Data is processed locally and not stored.
          </p>
          
          <div className="flex items-center space-x-2 max-w-xs mx-auto mb-4 justify-center">
              <Checkbox id="ai-consent" checked={consent} onCheckedChange={(c) => setConsent(c as boolean)} />
              <Label htmlFor="ai-consent" className="text-xs text-muted-foreground cursor-pointer">
                  I consent to local analysis of this document
              </Label>
          </div>

          {analyzing && (
            <div className="mb-4 space-y-2 max-w-xs mx-auto">
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Analyzing document structure...</span>
                 <span>{progress}%</span>
               </div>
               <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={analyzing || !consent} className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white">
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm p-4 bg-background rounded-lg border border-border/50">
                <div className="text-muted-foreground flex items-center gap-2">
                  <FileCheck className="w-3 h-3" /> Student
                </div>
                <div className="font-medium text-right">{result.studentName}</div>
                
                <div className="text-muted-foreground flex items-center gap-2">
                  <School className="w-3 h-3" /> Institution
                </div>
                <div className="font-medium text-right">{result.institution}</div>
                
                <div className="text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3 h-3" /> GPA
                </div>
                <div className="font-medium text-right">{result.gpa}</div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
                  <span className={`text-xl font-bold ${result.confidence > 80 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {result.confidence}%
                  </span>
               </div>
               <Progress value={result.confidence} className="h-2" />
               <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Low Match</span>
                  <span>High Match</span>
               </div>
            </div>

            {/* Checks Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Checks</h4>
              <div className="space-y-1">
                {result.checks.map((check: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-background/50 border border-border/30">
                    <span className="text-muted-foreground">{check.label}</span>
                    {check.passed ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 gap-1 pl-1 pr-2">
                        <CheckCircle2 className="w-3 h-3" /> Pass
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 gap-1 pl-1 pr-2">
                        <AlertTriangle className="w-3 h-3" /> Fail
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Alert variant={result.status === 'likely_match' ? "default" : "destructive"} className={result.status === 'likely_match' ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800" : "dark:bg-red-900/10"}>
                {result.status === 'likely_match' ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle className={result.status === 'likely_match' ? "text-green-800 dark:text-green-300" : ""}>
                    {result.status === 'likely_match' ? "High Confidence Match" : "Potential Issues Detected"}
                </AlertTitle>
                <AlertDescription className={result.status === 'likely_match' ? "text-green-700 dark:text-green-400" : ""}>
                    {result.explanation}
                </AlertDescription>
            </Alert>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded text-xs text-amber-800 dark:text-amber-200">
                <strong>Disclaimer:</strong> AI analysis is advisory only. You must manually verify the document before signing with your wallet.
            </div>
        </div>
      )}
    </div>
  );
}
