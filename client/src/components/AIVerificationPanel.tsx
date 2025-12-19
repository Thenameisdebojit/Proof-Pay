import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

interface AIVerificationPanelProps {
  onVerificationComplete?: (isValid: boolean) => void;
}

export function AIVerificationPanel({ onVerificationComplete }: AIVerificationPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate AI Analysis
    setTimeout(() => {
      setResult({
        studentName: "Jane Doe",
        institution: "Stellar University",
        gpa: "3.8/4.0",
        confidence: 0.95,
        status: "likely_match",
        explanation: "Document structure matches standard transcript format. Name and Institution align with fund requirements."
      });
      setAnalyzing(false);
      if (onVerificationComplete) onVerificationComplete(true);
    }, 2500);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          AI Advisory Verification
        </h3>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Beta</span>
      </div>

      {!result ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Upload document for local AI analysis. Data is ephemeral and not stored.
          </p>
          <Button onClick={handleAnalyze} disabled={analyzing} variant="outline" className="w-full">
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Student:</div>
                <div className="font-medium">{result.studentName}</div>
                <div className="text-muted-foreground">Institution:</div>
                <div className="font-medium">{result.institution}</div>
                <div className="text-muted-foreground">GPA:</div>
                <div className="font-medium">{result.gpa}</div>
            </div>

            <Alert variant={result.status === 'likely_match' ? "default" : "destructive"} className={result.status === 'likely_match' ? "border-green-200 bg-green-50" : ""}>
                {result.status === 'likely_match' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle className={result.status === 'likely_match' ? "text-green-800" : ""}>
                    {result.status === 'likely_match' ? "High Confidence Match" : "Potential Issues Detected"}
                </AlertTitle>
                <AlertDescription className={result.status === 'likely_match' ? "text-green-700" : ""}>
                    {result.explanation} (Confidence: {(result.confidence * 100).toFixed(0)}%)
                </AlertDescription>
            </Alert>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800">
                <strong>Disclaimer:</strong> AI analysis is advisory only. You must manually verify the document before signing with your wallet.
            </div>
        </div>
      )}
    </div>
  );
}
