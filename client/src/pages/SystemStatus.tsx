import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Server, Globe, Shield, Activity, Clock, Zap } from "lucide-react";

export default function SystemStatusPage() {
  const metrics = [
    { label: "Nodes Online", value: "3/3", status: "Operational", icon: Server, color: "text-green-500" },
    { label: "Network", value: "Stellar Testnet", status: "Healthy", icon: Globe, color: "text-blue-500" },
    { label: "Contract Uptime", value: "99.99%", status: "Stable", icon: Shield, color: "text-purple-500" },
    { label: "Avg Block Time", value: "5.1s", status: "Fast", icon: Clock, color: "text-orange-500" },
  ];

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
           <Zap className="w-8 h-8 text-yellow-500" />
           System Status
        </h1>
        <p className="text-muted-foreground">Real-time network performance and node health metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, i) => (
          <Card key={i} className="border-l-4 border-l-primary/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-2 bg-muted/30 rounded-lg ${metric.color}`}>
                    <metric.icon className="w-5 h-5" />
                 </div>
                 <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {metric.status}
                 </Badge>
              </div>
              <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">{metric.label}</p>
                 <p className="text-2xl font-bold font-display">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* TPS Chart (Mock) */}
         <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Transaction Throughput (TPS)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 flex items-end justify-between gap-2 px-2 pb-4 border-b border-border/50">
                    {[35, 42, 38, 55, 62, 48, 52, 59, 65, 60, 55, 70, 75, 68, 72].map((h, i) => (
                        <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                {h} TPS
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1 min ago</span>
                    <span>Live</span>
                </div>
            </CardContent>
         </Card>

         {/* Component Health */}
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Component Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Soroban RPC Indexer
                        </span>
                        <span className="text-green-600 font-medium">Operational</span>
                    </div>
                    <Progress value={100} className="h-2 bg-muted text-green-500" indicatorClassName="bg-green-500" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Horizon API
                        </span>
                        <span className="text-green-600 font-medium">Operational</span>
                    </div>
                    <Progress value={98} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            IPFS Gateway
                        </span>
                        <span className="text-green-600 font-medium">Operational</span>
                    </div>
                    <Progress value={100} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            AI Verification Engine
                        </span>
                        <span className="text-green-600 font-medium">Operational</span>
                    </div>
                    <Progress value={100} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                </div>
            </CardContent>
         </Card>
      </div>

      <div className="mt-8 p-4 bg-muted/20 rounded-xl border border-dashed border-border text-center">
         <p className="text-sm text-muted-foreground">
            ProofPay System v1.2.0-beta · Built on Soroban · 
            <span className="ml-2 font-mono text-xs">Contract: {import.meta.env.VITE_CONTRACT_ID || "CD73...R2Q3"}</span>
         </p>
      </div>
    </Layout>
  );
}
