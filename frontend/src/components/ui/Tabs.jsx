import React from "react";

/**
 * Tabs — thanh chuyển tab dùng chung (điều hướng chính, hoặc 4 tab bài tập
 * trong AI Generator).
 * items: [{ id, label, icon? }]
 */
export default function Tabs({ items, activeId, onChange, className = "" }) {
  return (
    <div className={`flex gap-1 bg-surface-soft rounded-2xl p-1 ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold",
              "transition-all duration-200",
              isActive
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-600 hover:text-slate",
            ].join(" ")}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
