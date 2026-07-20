import { Fragment } from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  mode?: "percent" | "steps";
  value?: number;
  totalSteps?: number;
  currentStep?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  mode = "percent",
  value = 0,
  totalSteps = 4,
  currentStep = 1,
  showLabel = true,
  className,
}: ProgressBarProps) {
  if (mode === "steps") {
    return (
      <div className={cn("flex items-center w-full", className)}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = stepNumber === totalSteps;
          return (
            <Fragment key={stepNumber}>
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ease-out",
                  isCompleted
                    ? "bg-success text-white"
                    : isActive
                      ? "bg-pink-400 text-white ring-4 ring-pink-100"
                      : "bg-surface-soft text-slate/40 border border-surface-border",
                )}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1.5 rounded-full transition-all duration-300 ease-out",
                    stepNumber < currentStep ? "bg-success" : "bg-surface-border",
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    clamped >= 80 ? "bg-success" : clamped > 0 ? "bg-warning" : "bg-pink-200";
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate/70">Tiến trình</span>
          <span className="text-xs font-bold text-slate">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 w-full rounded-full bg-surface-soft overflow-hidden"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            barColor,
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}