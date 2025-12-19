import { Check, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  date?: string;
  description?: string;
}

interface FundTimelineProps {
  status: string;
  createdAt?: string; // Optional creation date
  deadline?: string;
}

export function FundTimeline({ status, createdAt, deadline }: FundTimelineProps) {
  
  const getSteps = (): TimelineStep[] => {
    // Default Steps
    const steps: TimelineStep[] = [
      { label: "Fund Created", status: 'completed', date: createdAt, description: "Funds locked in contract" },
      { label: "Proof Submitted", status: 'pending' },
      { label: "Verified", status: 'pending' },
      { label: "Funds Released", status: 'pending' }
    ];

    if (status === "Locked") {
      steps[1].status = 'current';
    } else if (status === "Pending Verification") {
      steps[1].status = 'completed';
      steps[2].status = 'current';
    } else if (status === "Approved") {
      steps[1].status = 'completed';
      steps[2].status = 'completed';
      steps[3].status = 'current';
    } else if (status === "Released") {
      steps.forEach(s => s.status = 'completed');
    } else if (status === "Rejected") {
      steps[1].status = 'completed';
      steps[2].status = 'rejected';
      steps[2].label = "Rejected";
      steps[3].status = 'pending'; // or cancelled
    }

    return steps;
  };

  const steps = getSteps();

  return (
    <div className="relative space-y-0 pb-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex gap-4 pb-6 last:pb-0 relative">
          {/* Connecting Line */}
          {idx !== steps.length - 1 && (
            <div className={cn(
              "absolute left-3 top-7 bottom-0 w-0.5",
              step.status === 'completed' ? "bg-primary" : "bg-border"
            )} />
          )}

          {/* Icon */}
          <div className={cn(
            "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
            step.status === 'completed' ? "bg-primary border-primary text-primary-foreground" :
            step.status === 'current' ? "border-primary bg-background text-primary ring-2 ring-primary/20" :
            step.status === 'rejected' ? "bg-destructive border-destructive text-destructive-foreground" :
            "border-muted-foreground/30 bg-background text-muted-foreground"
          )}>
            {step.status === 'completed' ? <Check className="h-3 w-3" /> :
             step.status === 'rejected' ? <X className="h-3 w-3" /> :
             <Circle className="h-2 w-2 fill-current" />}
          </div>

          {/* Content */}
          <div className="flex flex-col -mt-0.5">
            <span className={cn(
              "text-sm font-medium",
              step.status === 'current' ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
            {step.description && (
              <span className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
