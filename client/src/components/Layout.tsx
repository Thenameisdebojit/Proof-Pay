import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  History, 
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SystemStatus } from "./SystemStatus";
import { useTheme } from "./theme-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected, address, balance, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDemoMode = (import.meta.env.VITE_CONTRACT_ID || "CD73R2Q3").startsWith("CD73R2Q3");
  const { theme, setTheme } = useTheme();
  const [lastSynced, setLastSynced] = useState<number>(Date.now());
  const [demoFailures, setDemoFailures] = useState(() => {
     return localStorage.getItem("proofpay_demo_failures") === "true";
  });

  // Sync Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
        // Just for visual effect of "synced X ago"
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Expose Demo Mode Failure State
  useEffect(() => {
    localStorage.setItem("proofpay_demo_failures", String(demoFailures));
  }, [demoFailures]);

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
    { label: "System Status", href: "/status", icon: Zap },
  ];

  const timeSinceSync = Math.floor((Date.now() - lastSynced) / 1000);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-body text-foreground transition-colors duration-300">
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
                {isDemoMode && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100">DEMO</Badge>}
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

        {/* Sync Status Badge */}
        <div className="px-6 py-2">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full w-fit">
                <RefreshCw className="w-3 h-3 animate-pulse text-green-500" />
                <span>Synced {timeSinceSync < 60 ? `${timeSinceSync}s` : '1m'} ago</span>
             </div>
        </div>

        {/* Demo Controls */}
        {isDemoMode && (
          <div className="px-6 py-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="demo-failures" checked={demoFailures} onCheckedChange={setDemoFailures} />
              <Label htmlFor="demo-failures" className="text-xs font-medium">Test Failure Modes</Label>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border space-y-4">
             {/* Theme Toggle */}
             <div className="flex justify-between items-center px-2">
                 <span className="text-xs font-medium text-muted-foreground">Theme</span>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                 </Button>
             </div>

             <SystemStatus />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 flex items-center justify-between px-6 sticky top-0 z-40">
           <h2 className="text-lg font-semibold tracking-tight hidden md:block">
              {navItems.find(i => i.href === location)?.label || "Dashboard"}
           </h2>

           <div className="flex items-center gap-4 ml-auto">
              {!isConnected ? (
                <Button onClick={handleConnect} disabled={isConnecting} className="shadow-sm">
                  {isConnecting ? (
                    <>Connecting...</> 
                  ) : (
                    <>
                      <Wallet className="mr-2 w-4 h-4" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="pl-2 pr-4 gap-2 h-9 border-muted-foreground/20">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {address?.charAt(0)}
                      </div>
                      <span className="hidden sm:inline-block font-mono text-xs">
                        {address?.substring(0, 4)}...{address?.slice(-4)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono bg-muted/50 mx-1 rounded">
                       {balance}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs gap-2">
                      <ExternalLink className="w-3 h-3" />
                      View on Stellar Expert
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={disconnectWallet} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
           </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6">
           {children}
        </div>
      </main>
    </div>
  );
}
