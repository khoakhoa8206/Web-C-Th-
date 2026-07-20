import { cn } from "@/lib/utils";

type Status = "completed" | "failed" | "in-progress";

const CFG: Record<
  Status,
  { label: string; bg: string; text: string; dot: string }
> = {
  completed: {
    label: "HOÀN THÀNH",
    bg: "bg-success-bg",
    text: "text-success-text",
    dot: "bg-success",
  },
  failed: {
    label: "CHƯA ĐẠT",
    bg: "bg-danger-bg",
    text: "text-danger-text",
    dot: "bg-danger",
  },
  "in-progress": {
    label: "ĐANG HỌC",
    bg: "bg-warning-bg",
    text: "text-warning-text",
    dot: "bg-warning",
  },
};

export function BadgeStatus({
  status = "in-progress",
  animate = false,
  className,
}: {
  status?: Status;
  animate?: boolean;
  className?: string;
}) {
  const cfg = CFG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        cfg.bg,
        cfg.text,
        animate && "animate-complete-pop",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}