import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Activity
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isConnected, address, balance, connectWallet, disconnectWallet, isConnecting, isDemoMode } = useWallet();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (e) {
      console.error(e);
    }
  };

  // Define nav items based on role
  const getNavItems = () => {
      if (!user) return [];
      
      const items = [];
      if (user.role === 'Funder') {
          items.push({ label: "Funder Dashboard", href: "/dashboard/funder", icon: LayoutDashboard });
      }
      if (user.role === 'Beneficiary') {
          items.push({ label: "Beneficiary Portal", href: "/dashboard/beneficiary", icon: Wallet });
      }
      if (user.role === 'Verifier') {
           items.push({ label: "Verifier Portal", href: "/dashboard/verifier", icon: ShieldCheck });
      }
      
      items.push({ label: "Profile", href: "/profile", icon: UserIcon });
      items.push({ label: "System Status", href: "/status", icon: Activity });
      
      return items;
  };

  const navItems = getNavItems();

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

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header Logo */}
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

        {/* User Info */}
        {user && (
            <div className="px-6 mb-4">
                <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">{user.role}</Badge>
                </div>
            </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
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
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer Actions (Wallet + Logout) */}
        <div className="p-4 border-t border-border space-y-4">
            {/* Wallet Button */}
            <div className="flex flex-col gap-2">
                 {isConnected ? (
                     <div className="bg-card border rounded-lg p-3">
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-xs text-muted-foreground">Wallet Connected</span>
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         </div>
                         <p className="text-xs font-mono text-muted-foreground truncate mb-1" title={address || ""}>
                             {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                         </p>
                         <p className="font-bold text-sm">{balance}</p>
                         <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs" onClick={disconnectWallet}>Disconnect</Button>
                     </div>
                 ) : (
                     <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                         {isConnecting ? "Connecting..." : "Connect Wallet"}
                     </Button>
                 )}
            </div>

            {/* Logout */}
            <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
          </div>
      </main>

    </div>
  );
}
