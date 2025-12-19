import { OnChainFund } from "@/lib/soroban-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { FundTimeline } from "@/components/FundTimeline";

interface FundCardProps {
  fund: OnChainFund;
  role: 'Funder' | 'Beneficiary' | 'Verifier';
  onAction?: (fund: OnChainFund) => void;
  actionLabel?: string;
  isActionLoading?: boolean;
}

export function FundCard({ fund, role, onAction, actionLabel, isActionLoading }: FundCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Locked": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Pending Verification": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Approved": return "bg-green-100 text-green-700 border-green-200";
      case "Released": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getFlowInfo = () => {
      if (fund.status === "Locked") {
          return {
              next: "Beneficiary must submit proof.",
              consequence: "If deadline passes, Funder can refund.",
              who: "Beneficiary"
          };
      }
      if (fund.status === "Pending Verification") {
          return {
              next: "Verifier must review proof.",
              consequence: "Funds remain locked until decision.",
              who: "Verifier"
          };
      }
      if (fund.status === "Approved") {
          return {
              next: "Funds ready for release.",
              consequence: "Beneficiary receives funds.",
              who: "Automated/Verifier"
          };
      }
      return null;
  };

  const flow = getFlowInfo();

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className={getStatusColor(fund.status)}>
              {fund.status}
            </Badge>
            <CardTitle className="text-xl font-display pt-2">
              {fund.amount} XLM
            </CardTitle>
          </div>
          <div className="text-xs text-muted-foreground text-right">
             <p>Deadline</p>
             <p className="font-medium text-red-600">
                {fund.deadline ? format(new Date(fund.deadline), "MMM d, yyyy") : "No Deadline"}
             </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {/* Timeline Visualization */}
        <div className="pb-2">
            <FundTimeline status={fund.status} deadline={fund.deadline} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Beneficiary</p>
            <p className="font-mono text-xs bg-muted/50 p-1.5 rounded truncate" title={fund.beneficiaryAddress}>
              {fund.beneficiaryAddress.substring(0, 8)}...{fund.beneficiaryAddress.slice(-4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Verifier</p>
            <p className="font-mono text-xs bg-muted/50 p-1.5 rounded truncate" title={fund.verifierAddress}>
              {fund.verifierAddress.substring(0, 8)}...{fund.verifierAddress.slice(-4)}
            </p>
          </div>
        </div>
        
        {/* Guided Flow Box */}
        {flow && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-blue-900">
                    <span>Next: {flow.next}</span>
                    <span className="uppercase text-[10px] bg-blue-200 px-1 rounded">{flow.who}</span>
                </div>
                <div className="text-blue-700">
                    ⚠️ {flow.consequence}
                </div>
            </div>
        )}

        {fund.proofDescription && (
          <div className="text-xs text-muted-foreground">
             <span className="font-semibold">Proof:</span> {fund.proofDescription}
          </div>
        )}
      </CardContent>

      {onAction && (
        <CardFooter className="bg-muted/10 pt-4">
          <Button 
            className="w-full gap-2" 
            onClick={() => onAction(fund)}
            disabled={isActionLoading}
          >
            {actionLabel || "View Details"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
