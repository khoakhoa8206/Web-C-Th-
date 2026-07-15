import React from "react";

/**
 * FilterBar — chọn Khối lớp và Buổi học cho Master Dashboard.
 * Dùng <select> gốc (không phải component tuỳ biến) để đảm bảo hoạt động
 * tốt trên mọi trình duyệt/thiết bị mà không cần thêm thư viện.
 */
export default function FilterBar({
  grades,
  sessions,
  selectedGradeId,
  selectedSessionId,
  onGradeChange,
  onSessionChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate/50 mb-1">Khối lớp</label>
        <select
          value={selectedGradeId}
          onChange={(e) => onGradeChange(e.target.value)}
          className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
        >
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate/50 mb-1">Buổi học</label>
        <select
          value={selectedSessionId ?? ""}
          onChange={(e) => onSessionChange(e.target.value)}
          disabled={sessions.length === 0}
          className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 disabled:opacity-50"
        >
          {sessions.length === 0 && <option value="">Chưa có buổi học</option>}
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
