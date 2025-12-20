import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    Locked: "bg-amber-100 text-amber-700 border-amber-200",
    "Pending Verification": "bg-blue-100 text-blue-700 border-blue-200",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Released: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const style = styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", style, className)}>
      {status}
    </span>
  );
}
