import { Layout } from "@/components/Layout";
import { useFunds } from "@/hooks/use-funds";
import { Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

export default function History() {
  const { data: funds, isLoading } = useFunds();

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Transaction History</h1>
        <p className="text-muted-foreground">A complete ledger of all scholarship disbursements.</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Amount (XLM)</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Verifier</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds?.map((fund) => (
                <TableRow key={fund.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium text-muted-foreground text-xs">
                    {fund.createdAt ? format(new Date(fund.createdAt), "MMM d, yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="font-bold font-mono">{fund.amount}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground" title={fund.beneficiaryAddress}>
                    {fund.beneficiaryAddress.substring(0, 12)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground" title={fund.verifierAddress}>
                    {fund.verifierAddress.substring(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={fund.status} />
                  </TableCell>
                </TableRow>
              ))}
              {(!funds || funds.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Layout>
  );
}
