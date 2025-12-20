import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useWallet } from '@/context/WalletContext';
import { useFunds } from '@/hooks/use-funds';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function BeneficiaryNotification() {
  const { address } = useWallet();
  const [_, setLocation] = useLocation();
  const { data: funds } = useFunds(
    address ? { role: 'Beneficiary', address } : undefined
  );
  
  const [activeFund, setActiveFund] = useState<any>(null);

  useEffect(() => {
    if (!funds || !address) return;

    // Detect new Fund entries where status === "Locked" (Pending)
    // We want to notify about funds that need action
    const pendingFund = funds.find(f => f.status === "Locked");

    if (pendingFund) {
      // Check if dismissed
      const key = `dismissed_fund_${pendingFund.id}`;
      if (localStorage.getItem(key)) {
        setActiveFund(null);
      } else {
        setActiveFund(pendingFund);
      }
    } else {
      setActiveFund(null);
    }
  }, [funds, address]);

  const handleDismiss = () => {
    if (activeFund) {
      localStorage.setItem(`dismissed_fund_${activeFund.id}`, 'true');
      setActiveFund(null);
    }
  };

  const handleScrollToFund = () => {
    if (activeFund) {
        // Navigate to beneficiary page if not there
        setLocation('/beneficiary');
        // Small timeout to allow navigation to complete
        setTimeout(() => {
            const element = document.getElementById(`fund-card-${activeFund.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary highlight effect
                element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
                setTimeout(() => element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2'), 2000);
            }
        }, 100);
    }
  };

  if (!activeFund) return null;

  return (
    <div className="w-full mb-6 animate-in slide-in-from-top-5 fade-in duration-500">
      <Card className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-900 border-l-4 border-l-indigo-600 shadow-md p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full mt-1">
                    <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                        🎉 Scholarship Funds Available
                    </h3>
                    <p className="text-indigo-700 dark:text-indigo-300 mt-1">
                        <span className="font-mono font-bold text-lg">₹{activeFund.amount.toLocaleString()}</span> has been locked for you by <span className="font-semibold">{activeFund.funderName || 'Institution'}</span>.
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                        Action required: Submit proof before {new Date(activeFund.deadline).toLocaleDateString()}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                    onClick={handleScrollToFund}
                    className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                    Submit Proof <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDismiss} className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10">
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
