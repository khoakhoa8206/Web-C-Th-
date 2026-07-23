import React from "react";
import { Button } from ".. ./ui";

 *
 * Tab Flashcard — chỉnh sửa trực tiếp (inline edit) từ, nghĩa, phiên âm
 * của từng thẻ bằng input trong suốt (giống contentEditable nhưng ổn định
 * hơn trên mọi trình duyệt/IME tiếng Việt).
 */
export default function FlashcardEditTab({ items, onChange }) {
  const updateItem = (id, patch) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  const addItem = () => {
    const newId = `w${Date.now()}`;
    onChange([...items, { id: newId, word: "", meaning: "", phonetic: "" }]);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="bg-white rounded-2xl border border-surface-border p-4 flex gap-3 items-start">
          <span className="text-xs font-bold text-slate-900 mt-2 w-5">{idx + 1}</span>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={item.word}
              onChange={(e) => updateItem(item.id, { word: e.target.value })}
              placeholder="Từ tiếng Anh"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-pink-300 focus:bg-white"
             
            <input
              value={item.meaning}
              onChange={(e) => updateItem(item.id, { meaning: e.target.value })}
              placeholder="Nghĩa tiếng Việt"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pink-300 focus:bg-white"
             
            <input
              value={item.phonetic}
              onChange={(e) => updateItem(item.id, { phonetic: e.target.value })}
              placeholder="Phiên âm"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pink-300 focus:bg-white"
             
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-danger-text text-xs font-semibold mt-2 shrink-0"
            aria-label="Xoá thẻ"
          >
            Xoá
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addItem}>
        + Thêm thẻ
      </Button>
    </div>
  );
}
