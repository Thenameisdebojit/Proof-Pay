import { useIsFetching } from "@tanstack/react-query";
import { Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function BlockchainSyncStatus() {
  const isFetching = useIsFetching();
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState("Just now");

  useEffect(() => {
    if (!isFetching) {
      setLastSynced(new Date());
    }
  }, [isFetching]);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastSynced.getTime()) / 1000);
      if (seconds < 60) {
        setTimeAgo(`${seconds} s ago`);
      } else {
        setTimeAgo("1 m ago");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300",
      isFetching 
        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    )}>
      {isFetching ? (
        <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Syncing with Soroban...</span>
        </>
      ) : (
        <>
            <LinkIcon className="w-3 h-3" />
            <span>Synced with blockchain · {timeAgo}</span>
        </>
      )}
    </div>
  );
}
