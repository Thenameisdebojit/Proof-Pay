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
  ShieldAlert
} from "lucide-react";
import { format } from "date-fns";

interface FundCardProps {
  fund: Fund;
  role: 'Funder' | 'Beneficiary' | 'Verifier';
  onAction?: (fund: Fund) => void;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Locked": return <Clock className="w-3.5 h-3.5 mr-1" />;
      case "Pending Verification": return <ShieldAlert className="w-3.5 h-3.5 mr-1" />;
      case "Approved": return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "Released": return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "Rejected": return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className={getStatusColor(fund.status)}>
              {getStatusIcon(fund.status)}
              {fund.status}
            </Badge>
            <CardTitle className="text-xl font-display pt-2">
              {fund.amount} XLM
            </CardTitle>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <p>Created</p>
            <p className="font-medium">{fund.createdAt ? format(new Date(fund.createdAt), "MMM d, yyyy") : "N/A"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Beneficiary</p>
            <p className="font-mono text-xs bg-muted/50 p-1.5 rounded truncate" title={fund.beneficiaryAddress}>
              {fund.beneficiaryAddress}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Verifier</p>
            <p className="font-mono text-xs bg-muted/50 p-1.5 rounded truncate" title={fund.verifierAddress}>
              {fund.verifierAddress}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Conditions</p>
          <div className="bg-secondary/20 p-3 rounded-lg text-sm text-foreground/80 line-clamp-2 border border-border/50">
            {fund.conditions}
          </div>
        </div>

        {fund.proofDescription && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Proof Submitted
            </p>
            <p className="text-sm italic text-foreground/70">"{fund.proofDescription}"</p>
            {fund.ipfsHash && (
              <a 
                href={`https://ipfs.io/ipfs/${fund.ipfsHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-1 inline-block"
              >
                View Attachment (IPFS)
              </a>
            )}
          </div>
        )}
      </CardContent>

      {onAction && (
        <CardFooter className="bg-muted/20 border-t p-4">
          <Button 
            onClick={() => onAction(fund)} 
            disabled={isActionLoading}
            className="w-full bg-white border border-border hover:bg-primary hover:text-white hover:border-primary transition-colors text-foreground shadow-sm"
          >
            {isActionLoading ? "Processing..." : (
              <>
                {actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
