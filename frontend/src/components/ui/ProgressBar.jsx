import React from "react";

/**
 * ProgressBar — thanh tiến trình của Design System Pastel Pink.
 *
 * Mode "percent": hiển thị % hoàn thành dạng thanh liền mạch.
 *   <ProgressBar mode="percent" value={65} />
 *
 * Mode "steps": hiển thị các bước rời rạc (1 -> 2 -> 3 -> 4).
 *   <ProgressBar mode="steps" totalSteps={4} currentStep={2} />
 *
 * Màu thanh tự đổi theo ngưỡng khi mode="percent":
 *   >= 80%  -> success (Hoàn thành)
 *   > 0%    -> warning (Đang làm dở)
 *   0%      -> pink nhạt mặc định
 */
export default function ProgressBar({
  mode = "percent",
  value = 0,
  totalSteps = 4,
  currentStep = 1,
  showLabel = true,
  className = "",
}) {
  if (mode === "steps") {
    return (
      <div className={`flex items-center w-full ${className}`}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = stepNumber === totalSteps;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                    "transition-all duration-300 ease-out",
                    isCompleted
                      ? "bg-success text-white"
                      : isActive
                      ? "bg-pink-400 text-white ring-4 ring-pink-100"
                      : "bg-surface-soft text-slate/60 border border-surface-border",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
              </div>
              {!isLast && (
                <div
                  className={[
                    "flex-1 h-1 mx-1.5 rounded-full transition-all duration-300 ease-out",
                    stepNumber < currentStep ? "bg-success" : "bg-surface-border",
                  ].join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // mode === "percent"
  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    clamped >= 80 ? "bg-success" : clamped > 0 ? "bg-warning" : "bg-pink-200";

  return (
    <div className={`w-full ${className}`}>
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
          className={`h-full rounded-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
