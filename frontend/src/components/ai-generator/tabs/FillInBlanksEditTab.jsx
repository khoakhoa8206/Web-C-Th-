import React from "react";
import { Button } from "../../ui";

/** Tab Điền từ — chỉnh sửa 5-10 từ dùng cho bài tập điền khuyết. */
export default function FillInBlanksEditTab({ items, onChange }) {
  const updateItem = (id, patch) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  const addItem = () => {
    if (items.length >= 10) return;
    onChange([...items, { id: `w${Date.now()}`, word: "", meaning: "" }]);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate/70">
        Nên giữ 5-10 từ. Chiều hỏi (Anh→Việt / Việt→Anh) sẽ tự xen kẽ khi học sinh làm bài.
      </p>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-white rounded-2xl border border-surface-border p-3 flex gap-3 items-center">
          <span className="text-xs font-bold text-slate/60 w-5">{idx + 1}</span>
          <input
            value={item.word}
            onChange={(e) => updateItem(item.id, { word: e.target.value })}
            placeholder="Từ tiếng Anh"
            className="flex-1 rounded-xl border border-transparent bg-pink-50/60 px-3 py-2 text-sm font-bold text-slate outline-none focus:border-pink-300 focus:bg-white"
          />
          <input
            value={item.meaning}
            onChange={(e) => updateItem(item.id, { meaning: e.target.value })}
            placeholder="Nghĩa tiếng Việt"
            className="flex-1 rounded-xl border border-transparent bg-pink-50/60 px-3 py-2 text-sm text-slate outline-none focus:border-pink-300 focus:bg-white"
          />
          <button onClick={() => removeItem(item.id)} className="text-danger-text text-xs font-semibold shrink-0">
            Xoá
          </button>
        </div>
      ))}
      {items.length < 10 && (
        <Button variant="ghost" size="sm" onClick={addItem}>
          + Thêm từ
        </Button>
      )}
    </div>
  );
}
