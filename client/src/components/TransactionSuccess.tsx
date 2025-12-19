
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionSuccessProps {
  hash: string;
  onDismiss: () => void;
}

export function TransactionSuccess({ hash, onDismiss }: TransactionSuccessProps) {
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${hash}`;

  return (
    <div className="mb-6 p-4 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
      <div className="p-1 bg-green-100 dark:bg-green-800 rounded-full mt-0.5">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
          Confirmed On-Chain
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </h4>
        <p className="text-xs text-muted-foreground">
          Transaction successfully finalized on Stellar Testnet.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <code className="text-[10px] font-mono bg-background/50 px-2 py-1 rounded border border-border/50 text-muted-foreground">
            {hash.substring(0, 16)}...{hash.slice(-16)}
          </code>
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            View Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onDismiss}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
