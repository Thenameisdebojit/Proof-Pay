import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  History, 
  Menu,
  X
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SystemStatus } from "./SystemStatus";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected, address, balance, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDemoMode = (import.meta.env.VITE_CONTRACT_ID || "CD73R2Q3").startsWith("CD73R2Q3");


  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: "Funder Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Beneficiary Portal", href: "/beneficiary", icon: Wallet },
    { label: "Verifier Portal", href: "/verifier", icon: ShieldCheck },
    { label: "History", href: "/history", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-body text-foreground">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            P
          </div>
          <span className="font-display font-bold text-xl">ProofPay</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl tracking-tight">ProofPay</h1>
                {isDemoMode && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-100 text-amber-800 hover:bg-amber-100">DEMO</Badge>}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Conditional Disbursements</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <SystemStatus />
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-200 ease-in-out",
        mobileMenuOpen ? "ml-64" : "ml-0"
      )}>
        {/* Header Strip */}
        <header className="h-16 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu />
            </Button>
            <h2 className="font-display font-semibold text-lg capitalize">
              {location === "/" ? "Funder Dashboard" : location.replace("/", "").replace("-", " ")}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
               Network: Testnet
             </div>

             {/* Wallet Connection - Moved to Header */}
             {isConnected && address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-border/50 bg-secondary/50 hover:bg-secondary/80 transition-all">
                      <div className="flex flex-col items-end text-xs mr-1">
                        <span className="font-mono font-medium">{balance}</span>
                        <span className="text-muted-foreground">{address.substring(0, 4)}...{address.substring(address.length - 4)}</span>
                      </div>
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {address.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={disconnectWallet} className="text-destructive focus:text-destructive cursor-pointer">
                       Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleConnect} disabled={isConnecting} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
