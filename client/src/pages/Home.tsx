import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/context/WalletContext";
import { Link, useLocation } from "wouter";
import { ShieldCheck, Wallet, ArrowRight, Activity, Users, FileCheck } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { isConnected, connectWallet, isConnecting } = useWallet();
  const [, setLocation] = useLocation();

  const handleConnect = async () => {
    await connectWallet();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      {/* Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            P
          </div>
          <span className="font-display font-bold text-xl">ProofPay</span>
        </div>
        <div className="flex items-center gap-4">
           {!isConnected && (
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
           )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Smart Conditional Disbursements
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure, transparent, and automated fund release based on verified milestones using Stellar Smart Contracts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {!isConnected ? (
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-12" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? "Connecting Freighter..." : "Connect Wallet to Start"} <Wallet className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <div className="grid gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm font-medium text-muted-foreground mb-2">Select your role to continue:</p>
                <Link href="/dashboard/funder">
                  <Button className="w-full justify-between group" variant="outline" size="lg">
                    <span>Funder Dashboard</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Link href="/dashboard/beneficiary">
                  <Button className="w-full justify-between group" variant="outline" size="lg">
                    <span>Beneficiary Portal</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Link href="/dashboard/verifier">
                  <Button className="w-full justify-between group" variant="outline" size="lg">
                    <span>Verifier Interface</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
          <FeatureCard 
            icon={<Users className="w-10 h-10 text-primary" />}
            title="For Funders"
            description="Create scholarship funds with specific conditions. Track usage and ensure funds are used as intended."
          />
          <FeatureCard 
            icon={<FileCheck className="w-10 h-10 text-indigo-500" />}
            title="For Beneficiaries"
            description="Upload proofs of work or achievement. Receive funds automatically upon verification."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-10 h-10 text-emerald-500" />}
            title="For Verifiers"
            description="Review submitted documents and proofs. Approve valid claims to trigger smart contract payments."
          />
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} ProofPay. Built on Stellar.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
