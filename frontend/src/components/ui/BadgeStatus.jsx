import React from "react";

/**
 * BadgeStatus — thẻ hiển thị trạng thái hoàn thành bài học/từ vựng.
 *
 * status: "completed" | "failed" | "in-progress"
 *   completed   -> "HOÀN THÀNH"  (xanh lá pastel), dùng khi điểm >= 80%
 *   failed      -> "CHƯA ĐẠT"    (đỏ pastel), dùng khi điểm < 80%
 *   in-progress -> "ĐANG HỌC"    (vàng pastel)
 *
 * Usage:
 *   <BadgeStatus status="completed" />
 *   <BadgeStatus status="failed" animate />
 */
const STATUS_CONFIG = {
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

export default function BadgeStatus({ status = "in-progress", animate = false, className = "" }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["in-progress"];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "text-xs font-bold tracking-wide",
        config.bg,
        config.text,
        animate ? "animate-complete-pop" : "",
        className,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
