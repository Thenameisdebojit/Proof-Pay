import { Fund } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FundCardProps {
  fund: any; // Using any to support enriched OnChainFund
  role: 'Funder' | 'Beneficiary' | 'Verifier';
  onAction?: (fund: any) => void;
  actionLabel?: string;
  isActionLoading?: boolean;
}

export function FundCard({ fund, role, onAction, actionLabel, isActionLoading }: FundCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Locked": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Pending Verification": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Approved": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Released": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Guided State Logic
  const getStateInfo = (status: string) => {
      switch (status) {
          case "Locked":
              return { actor: "Beneficiary", next: "Submit Proof", waiting: "Beneficiary to submit proof" };
          case "Pending Verification":
              return { actor: "Verifier", next: "Review & Approve", waiting: "Verifier to review proof" };
          case "Approved":
              return { actor: "Beneficiary", next: "Claim Funds", waiting: "Beneficiary to claim funds" };
          case "Released":
              return { actor: "Completed", next: "None", waiting: "Fund cycle complete" };
          case "Rejected":
              return { actor: "Funder", next: "Refund", waiting: "Fund rejected" };
          default:
              return { actor: "Unknown", next: "Unknown", waiting: "Unknown" };
      }
  };

  const stateInfo = getStateInfo(fund.status);
  const isMyTurn = (role === stateInfo.actor);

  // Timeline Logic
  const steps = ["Locked", "Pending Verification", "Approved", "Released"];
  const currentStepIndex = steps.indexOf(fund.status);

  // Task 2: "What Happens Next?" Logic
  const getExplanation = (status: string) => {
    switch (status) {
        case "Locked":
            return {
                status: "Scholarship Locked",
                actor: "Beneficiary (Student)",
                next: "Submit proof (documents/results)",
                consequence: "Funder can refund after deadline"
            };
        case "Pending Verification":
            return {
                status: "Proof Submitted",
                actor: "Verifier (Institution)",
                next: "Approve proof",
                consequence: "Funder can refund after deadline"
            };
        case "Approved":
            return {
                status: "Proof Approved",
                actor: "Beneficiary (Student)",
                next: "Claim funds to wallet",
                consequence: "Funds remain locked until claimed"
            };
        case "Released":
            return {
                status: "Funds Released",
                actor: "None (Completed)",
                next: "None",
                consequence: "Transaction is final"
            };
        case "Rejected":
            return {
                status: "Proof Rejected",
                actor: "Funder",
                next: "Refund",
                consequence: "Funds returned to funder"
            };
        default:
            return {
                status: "Unknown",
                actor: "Unknown",
                next: "Unknown",
                consequence: "Unknown"
            };
    }
  };

  const explanation = getExplanation(fund.status);

  return (
    <Card id={`fund-card-${fund.id}`} className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className={getStatusColor(fund.status)}>
              {fund.status === "Locked" && <Clock className="w-3.5 h-3.5 mr-1" />}
              {fund.status === "Pending Verification" && <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
              {fund.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
              {fund.status === "Released" && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
              {fund.status}
            </Badge>
            <CardTitle className="text-xl font-display pt-2">
              {fund.amount} XLM
            </CardTitle>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <p>Deadline</p>
            <p className="font-medium text-red-500">{fund.deadline ? format(new Date(fund.deadline), "MMM d, yyyy") : "N/A"}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-5 flex-1">
        {/* Timeline */}
        <div className="relative flex items-center justify-between text-[10px] font-medium text-muted-foreground px-1">
            {/* Connecting Line */}
            <div className="absolute top-1.5 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
            
            {/* Steps */}
            {steps.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                
                return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-1 group/step">
                        <div className={cn(
                            "w-3 h-3 rounded-full border-2 transition-colors duration-500",
                            isCompleted ? "bg-primary border-primary" : "bg-background border-gray-300",
                            isCurrent && "ring-2 ring-offset-1 ring-primary"
                        )} />
                        <span className={cn(
                            "transition-opacity duration-300 absolute top-4 w-20 text-center",
                            isCurrent ? "opacity-100 font-bold text-foreground" : "opacity-0 group-hover/step:opacity-100"
                        )}>
                            {step === "Locked" ? "Created" : step}
                        </span>
                    </div>
                );
            })}
        </div>
        
        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Beneficiary</p>
            <p className="font-mono text-[10px] bg-muted/50 p-1.5 rounded truncate" title={fund.beneficiaryAddress}>
              {fund.beneficiaryAddress}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Verifier</p>
            <p className="font-mono text-[10px] bg-muted/50 p-1.5 rounded truncate" title={fund.verifierAddress}>
              {fund.verifierAddress}
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Conditions</p>
          <div className="bg-secondary/20 p-3 rounded-lg text-sm text-foreground/80 line-clamp-2 border border-border/50 text-xs">
            {fund.conditions || "No conditions specified."}
          </div>
        </div>

        {/* Guided State Explanation (Task 2) */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm space-y-2">
             <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Current Status</span>
                <Badge variant="outline" className={cn("font-bold", getStatusColor(fund.status))}>
                    {explanation.status}
                </Badge>
             </div>
             
             <div className="grid grid-cols-[1fr_auto] gap-2 text-xs md:text-sm">
                <span className="text-slate-500 dark:text-slate-400">Who Can Act Now</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-right">{explanation.actor}</span>
                
                <span className="text-slate-500 dark:text-slate-400">Next Step</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-right">{explanation.next}</span>
                
                <span className="text-slate-500 dark:text-slate-400">If Nothing Happens</span>
                <span className="text-amber-600 dark:text-amber-500 text-right">{explanation.consequence}</span>
             </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {onAction && actionLabel && (
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
            onClick={() => onAction(fund)}
            disabled={isActionLoading}
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
