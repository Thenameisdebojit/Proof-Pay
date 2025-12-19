import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { stellarService } from "@/lib/stellarService";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [wallet, setWallet] = useState<{ address: string; balance: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock auto-connect or stored session
  useEffect(() => {
    const stored = localStorage.getItem("proofpay_wallet");
    if (stored) {
      setWallet(JSON.parse(stored));
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const data = await stellarService.connectWallet();
      setWallet({ address: data.address, balance: data.balance });
      localStorage.setItem("proofpay_wallet", JSON.stringify({ address: data.address, balance: data.balance }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("proofpay_wallet");
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
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight">ProofPay</h1>
            <p className="text-xs text-muted-foreground font-medium">Conditional Disbursements</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer",
                  location === item.href 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {wallet ? (
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {wallet.address.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-medium truncate text-foreground">{wallet.address}</p>
                  <p className="text-xs text-primary font-bold">{wallet.balance}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8 text-xs gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                onClick={handleDisconnect}
              >
                <LogOut className="w-3 h-3" /> Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-primary/20"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background/50 relative">
        {/* Header Strip */}
        <header className="h-16 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg capitalize">
            {location === "/" ? "Funder Dashboard" : location.replace("/", "").replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
             {/* Role Switcher or additional header actions could go here */}
             <div className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
               Network: Testnet
             </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
