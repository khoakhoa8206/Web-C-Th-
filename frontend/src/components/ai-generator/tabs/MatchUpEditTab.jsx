import React from "react";
import { Button } from "../../ui";

/** Tab Nối từ — chỉnh sửa cặp từ/nghĩa dùng cho trò chơi kéo-thả. */
export default function MatchUpEditTab({ items, onChange }) {
  const updateItem = (id, patch) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  const addItem = () => {
    onChange([...items, { id: `w${Date.now()}`, word: "", meaning: "" }]);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        Mỗi cặp sẽ trở thành 1 thẻ tiếng Anh + 1 ô nghĩa tương ứng trong trò chơi nối từ.
      </p>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-white rounded-2xl border border-surface-border p-3 flex gap-3 items-center">
          <span className="text-xs font-bold text-slate-600 w-5">{idx + 1}</span>
          <input
            value={item.word}
            onChange={(e) => updateItem(item.id, { word: e.target.value })}
            placeholder="Từ tiếng Anh"
            className="flex-1 rounded-xl border border-transparent bg-pink-50/60 px-3 py-2 text-sm font-bold text-slate outline-none focus:border-pink-300 focus:bg-white"
          />
          <span className="text-slate-600">→</span>
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
      <Button variant="ghost" size="sm" onClick={addItem}>
        + Thêm cặp từ
      </Button>
    </div>
  );
}
