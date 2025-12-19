import { Badge } from "@/components/ui/badge";
import { Zap, Database, Globe, Users } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function SystemStatus() {
  return (
    <div className="flex flex-col gap-2 mt-auto p-4 border-t bg-muted/20">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Network Scalability</p>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 text-xs text-slate-600 cursor-help hover:text-primary transition-colors">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Soroban Testnet (Futurenet)</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">High Throughput</h4>
              <p className="text-sm">
                Powered by Stellar Soroban's parallel execution model. 
                Capable of processing 1000s of disbursements per second.
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 text-xs text-slate-600 cursor-help hover:text-primary transition-colors">
            <Database className="w-3 h-3 text-blue-500" />
            <span>Zero-Backend Architecture</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Decentralized Storage</h4>
              <p className="text-sm">
                No central database. All fund states are queried directly from the blockchain (TTL-managed ledger entries) and IPFS for proofs.
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Globe className="w-3 h-3 text-green-500" />
        <span className="truncate">IPFS Gateway: Active</span>
      </div>
    </div>
  );
}
