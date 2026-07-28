import React, { useState } from "react";
import { Button } from "../../ui";

const OPTION_LABELS = ["A", "B", "C", "D"];

/**
 * Tab Trắc nghiệm — chỉnh sửa câu hỏi, 4 đáp án, đáp án đúng.
 * Thêm: chọn số câu sẽ hiển thị và chọn từ nào được hỏi trước khi publish.
 */
export default function MCQEditTab({ items, onChange }) {
  const [selectedIds, setSelectedIds] = useState(null); // null = tất cả
  const [questionCount, setQuestionCount] = useState(null); // null = tất cả

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
        enabled: true,
      },
    ]);
  };

  const toggleEnabled = (id) => {
    onChange(items.map((q) => (q.id === id ? { ...q, enabled: q.enabled === false ? true : false } : q)));
  };

  const enabledCount = items.filter((q) => q.enabled !== false).length;
  const totalCount = items.length;

  return (
    <div className="space-y-4">
      {/* Config panel */}
      <div className="bg-pink-50 rounded-2xl border border-pink-100 p-4 space-y-3">
        <p className="text-sm font-bold text-slate">⚙️ Cấu hình bài 4 trước khi publish</p>

        <div>
          <label className="block text-xs font-semibold text-slate/70 mb-1">
            Số câu hỏi hiển thị ({enabledCount}/{totalCount} câu đang bật)
          </label>
          <p className="text-xs text-slate/60 mb-2">
            Bỏ tích câu hỏi bên dưới để ẩn câu đó khỏi bài làm của học sinh.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={totalCount}
              value={questionCount ?? totalCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1 accent-pink-500"
            />
            <span className="text-sm font-bold text-pink-600 w-16 text-right">
              {questionCount ?? totalCount} câu
            </span>
          </div>
          {(questionCount ?? totalCount) < totalCount && (
            <p className="text-xs text-warning-text mt-1">
              ⚡ Học sinh sẽ làm {questionCount ?? totalCount} câu ngẫu nhiên từ {totalCount} câu
            </p>
          )}
        </div>
      </div>

      {/* Question list */}
      {items.map((q, qIdx) => (
        <div
          key={q.id}
          className={[
            "bg-white rounded-2xl border p-4 transition-all",
            q.enabled === false
              ? "border-surface-border opacity-50"
              : "border-surface-border",
          ].join(" ")}
        >
          <div className="flex items-start gap-2 mb-3">
            <input
              type="checkbox"
              checked={q.enabled !== false}
              onChange={() => toggleEnabled(q.id)}
              className="mt-2.5 accent-pink-500 w-4 h-4 shrink-0 cursor-pointer"
              title="Bật/tắt câu hỏi này"
            />
            <span className="text-xs font-bold text-slate/60 mt-2.5 w-5">{qIdx + 1}</span>
            <input
              value={q.question}
              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              placeholder="Nội dung câu hỏi"
              className="flex-1 rounded-xl border border-transparent bg-pink-50/60 px-3 py-2 text-sm font-bold text-slate outline-none focus:border-pink-300 focus:bg-white"
              disabled={q.enabled === false}
            />
            <button
              onClick={() => removeQuestion(q.id)}
              className="text-danger-text text-xs font-semibold mt-2.5 shrink-0"
            >
              Xoá
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-11">
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
                  disabled={q.enabled === false}
                />
                <span className="text-xs font-bold text-slate/70 w-4">{OPTION_LABELS[optIdx]}</span>
                <input
                  value={opt.text}
                  onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                  placeholder={`Đáp án ${OPTION_LABELS[optIdx]}`}
                  className="flex-1 bg-transparent text-sm text-slate outline-none"
                  disabled={q.enabled === false}
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-slate/60 pl-11 mt-2">Chọn nút tròn để đánh dấu đáp án đúng</p>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={addQuestion}>
        + Thêm câu hỏi
      </Button>
    </div>
  );
}
