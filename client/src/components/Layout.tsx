import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  History, 
  Menu,
  X,
  LogOut,
  Activity,
  User
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { address, disconnectWallet, isDemoMode } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { label: "Funder", href: "/dashboard/funder", icon: LayoutDashboard },
    { label: "Beneficiary", href: "/dashboard/beneficiary", icon: Wallet },
    { label: "Verifier", href: "/dashboard/verifier", icon: ShieldCheck },
    { label: "History", href: "/history", icon: History },
    { label: "Status", href: "/status", icon: Activity },
  ];

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col shadow-xl md:shadow-none",
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
            <p className="text-xs text-muted-foreground font-medium">Smart Disbursements</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === item.href 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
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

        <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Connected</p>
                    <p className="text-xs text-muted-foreground truncate" title={address || ""}>
                        {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Not connected"}
                    </p>
                </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={disconnectWallet}>
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-muted/5 p-4 md:p-8">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {children}
        </div>
      </main>
    </div>
  );
}
