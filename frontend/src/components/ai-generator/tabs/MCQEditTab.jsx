import React from "react";
import { Button } from "../../ui";

const OPTION_LABELS = ["A", "B", "C", "D"];

/** Tab Trắc nghiệm — chỉnh sửa câu hỏi, 4 đáp án, và chọn đáp án đúng. */
export default function MCQEditTab({ items, onChange }) {
  const updateQuestion = (id, patch) => {
    onChange(items.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };
  const updateOption = (qId, optIdx, text) => {
    onChange(
      items.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === optIdx ? { ...o, text } : o)) }
          : q
      )
    );
  };
  const removeQuestion = (id) => onChange(items.filter((q) => q.id !== id));
  const addQuestion = () => {
    onChange([
      ...items,
      {
        id: `q${Date.now()}`,
        question: "",
        options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        correctIndex: 0,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {items.map((q, qIdx) => (
        <div key={q.id} className="bg-white rounded-2xl border border-surface-border p-4">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xs font-bold text-slate-900 mt-2.5 w-5">{qIdx + 1}</span>
            <input
              value={q.question}
              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              placeholder="Nội dung câu hỏi"
              className="flex-1 rounded-xl border border-transparent bg-pink-50/60 px-3 py-2 text-sm font-bold text-slate outline-none focus:border-pink-300 focus:bg-white"
            />
            <button
              onClick={() => removeQuestion(q.id)}
              className="text-danger-text text-xs font-semibold mt-2.5 shrink-0"
            >
              Xoá
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
            {q.options.map((opt, optIdx) => (
              <label
                key={optIdx}
                className={[
                  "flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer",
                  q.correctIndex === optIdx
                    ? "border-success bg-success-bg"
                    : "border-surface-border bg-surface-soft",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correctIndex === optIdx}
                  onChange={() => updateQuestion(q.id, { correctIndex: optIdx })}
                  className="accent-pink-500"
                />
                <span className="text-xs font-bold text-slate-900 w-4">{OPTION_LABELS[optIdx]}</span>
                <input
                  value={opt.text}
                  onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                  placeholder={`Đáp án ${OPTION_LABELS[optIdx]}`}
                  className="flex-1 bg-transparent text-sm text-slate outline-none"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-900 pl-7 mt-2">Chọn nút tròn để đánh dấu đáp án đúng</p>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addQuestion}>
        + Thêm câu hỏi
      </Button>
    </div>
  );
}
