import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Globe, Shield, Clock, Activity } from "lucide-react";

export default function SystemStatus() {
  const metrics = [
    { label: "Nodes Online", value: "3/3", status: "Operational", icon: Server, color: "text-green-500" },
    { label: "Network", value: "Stellar Testnet", status: "Healthy", icon: Globe, color: "text-blue-500" },
    { label: "Contract Uptime", value: "99.99%", status: "Stable", icon: Shield, color: "text-purple-500" },
    { label: "Avg Block Time", value: "5.1s", status: "Fast", icon: Clock, color: "text-orange-500" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-display">System Status</h1>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                All Systems Operational
            </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
                <Card key={metric.label}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                            <span className="text-xs font-medium text-muted-foreground">{metric.status}</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold">{metric.value}</h3>
                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Transaction Throughput (TPS)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2 px-2">
                    {[35, 42, 38, 45, 40, 55, 48, 52, 49, 60, 58, 65].map((h, i) => (
                        <div key={i} className="w-full bg-primary/10 rounded-t-sm relative group">
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-primary/60 rounded-t-sm transition-all group-hover:bg-primary"
                                style={{ height: `${h}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                    <span>1 min ago</span>
                    <span>Live</span>
                </div>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
