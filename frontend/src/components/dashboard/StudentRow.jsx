import React from "react";

function formatDuration(seconds) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * StudentRow — 1 hàng trong bảng dashboard.
 * Color coding theo yêu cầu:
 *  - Đạt (score >= 80%)         → bg-emerald-50 text-emerald-700
 *  - Chưa làm / chưa đạt (<80%) → bg-red-50 text-red-700
 * Khi có sự kiện realtime mới (justUpdated), toàn hàng nhấp nháy nhẹ
 * bằng animate-fade-in-up + ring tạm thời.
 */
export default function StudentRow({ student, attemptInfo, onClickName }) {
  const attempt = attemptInfo?.latestAttempt;
  const hasAttempted = !!attempt;
  const passed = attempt?.passed ?? false;

  const statusStyles = !hasAttempted
    ? "bg-red-50 text-red-700"
    : passed
    ? "bg-emerald-50 text-emerald-700"
    : "bg-red-50 text-red-700";

  const statusLabel = !hasAttempted ? "Chưa làm bài" : passed ? "Hoàn thành" : "Chưa đạt";

  return (
    <tr
      className={[
        "border-b border-surface-border last:border-0 transition-all duration-300",
        attemptInfo?.justUpdated ? "bg-pink-50/70" : "bg-white",
      ].join(" ")}
    >
      <td className="px-4 py-3">
        <button
          onClick={() => onClickName(student)}
          className="font-semibold text-slate hover:text-pink-600 hover:underline text-left"
        >
          {student.full_name}
        </button>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusStyles}`}>
          {hasAttempted ? (passed ? "✓" : "✗") : "•"} {statusLabel}
          {hasAttempted && ` (${attempt.score}%)`}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-sm text-slate/70 tabular-nums">
        {attemptInfo?.attemptsCount ?? 0}
      </td>
      <td className="px-4 py-3 text-center text-sm text-slate/70 tabular-nums">
        {formatDuration(attempt?.duration_seconds)}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onClickName(student)}
          className="text-xs font-semibold text-pink-600 hover:underline"
        >
          Xem chi tiết →
        </button>
      </td>
    </tr>
  );
}
