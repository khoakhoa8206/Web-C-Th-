import React from "react";
import { Button } from "../ui";

const OPTION_LABELS = ["A", "B", "C", "D"];

/**
 * Bài 4 — MCQComponent (Trắc nghiệm)
 * Nhận danh sách câu hỏi ĐÃ được trộn (Fisher-Yates) từ PracticeFlow —
 * cả thứ tự câu hỏi lẫn thứ tự đáp án A/B/C/D đều được trộn lại mỗi khi
 * học sinh bấm "Làm lại" để chống học vẹt theo vị trí đáp án.
 */
export default function MCQComponent({
  questions,
  selections,
  onSelect,
  onReshuffle,
  onSubmit,
  isSubmitting,
  onBack,
}) {
  const answeredCount = Object.keys(selections).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate/50">
          Đã trả lời {answeredCount}/{questions.length} câu
        </p>
        <button
          type="button"
          onClick={onReshuffle}
          className="text-xs font-semibold text-pink-600 hover:underline"
        >
          🔀 Làm lại (trộn câu hỏi)
        </button>
      </div>

      <div className="space-y-5">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white rounded-2xl border border-surface-border p-4">
            <p className="font-bold text-slate mb-3">
              Câu {qIdx + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selections[q.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => onSelect(q.id, optIdx)}
                    className={[
                      "text-left px-4 py-2.5 rounded-xl border text-sm font-medium",
                      "transition-all duration-150 flex items-center gap-2",
                      isSelected
                        ? "bg-pink-400 border-pink-400 text-white shadow-button"
                        : "bg-surface-soft border-surface-border text-slate hover:border-pink-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
                        isSelected ? "bg-white/25" : "bg-white border border-surface-border",
                      ].join(" ")}
                    >
                      {OPTION_LABELS[optIdx]}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!allAnswered}
          isLoading={isSubmitting}
          onClick={onSubmit}
        >
          {allAnswered ? "Nộp bài" : `Trả lời hết ${questions.length} câu để nộp bài`}
        </Button>
      </div>
    </div>
  );
}
