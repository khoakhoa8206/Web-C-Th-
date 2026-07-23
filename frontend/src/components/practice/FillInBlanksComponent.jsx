import React, { useState, useMemo } from "react";
import { Button, InputField } from "../ui";

/**
 * Bài 3 — FillInBlanksComponent v3
 * - Chỉ hiện màu xanh/đỏ sau khi học sinh rời ô input (onBlur)
 * - Không lộ đáp án đúng khi đang gõ
 * - Không hiển thị gợi ý hay hint trong khi gõ
 */

function getPromptText(item) {
  if (item.direction === "vi_to_en") {
    return `Từ tiếng Anh nào có nghĩa là "${item.word}"?`;
  }
  return `"${item.word}" có nghĩa là gì?`;
}

function getPlaceholder(item) {
  return item.direction === "vi_to_en"
    ? "Gõ từ tiếng Anh..."
    : "Gõ nghĩa tiếng Việt...";
}

function checkAnswer(studentAnswer, correctAnswers) {
  if (!studentAnswer || !studentAnswer.trim()) return null;
  const normalized = studentAnswer.trim().toLowerCase();
  const answers = correctAnswers.split("|").map((a) => a.trim().toLowerCase());
  return answers.some((ans) => ans === normalized);
}

export default function FillInBlanksComponent({ items, values, onChange, onNext }) {
  // submitted: set của các item.id đã blur (rời ô) — lúc đó mới reveal màu
  const [submitted, setSubmitted] = useState(new Set());

  const isFilled = (item) => {
    const typed = values[item.id];
    return typed !== undefined && typed.trim() !== "";
  };

  const filledCount = items.filter(isFilled).length;
  const allFilled = filledCount === items.length;

  const correctCount = useMemo(() => {
    return items.filter((item) => {
      const result = checkAnswer(values[item.id], item.correct_answer || item.answer || "");
      return result === true;
    }).length;
  }, [items, values]);

  const handleChange = (id, val) => {
    // Khi đang gõ lại sau blur, reset trạng thái submitted để ẩn màu
    setSubmitted((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    onChange({ ...values, [id]: val });
  };

  const handleBlur = (id) => {
    // Chỉ đánh dấu submitted nếu có nội dung
    if (values[id]?.trim()) {
      setSubmitted((prev) => new Set(prev).add(id));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-base text-slate text-center">
          Điền {items.length} từ vựng · Đã điền {filledCount}/{items.length}
        </p>
        <p className="text-sm text-center text-success-text font-bold">
          ✓ Trả lời đúng: {correctCount}/{items.length}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const hasBlurred = submitted.has(item.id);
          const hasAnswered = isFilled(item);
          const isCorrect = hasBlurred
            ? checkAnswer(values[item.id], item.correct_answer || item.answer || "")
            : null;

          return (
            <div
              key={item.id}
              className={[
                "rounded-2xl border-2 p-4 transition-all duration-200",
                hasBlurred && isCorrect
                  ? "bg-success-bg border-success/30"
                  : hasBlurred && isCorrect === false
                  ? "bg-danger-bg border-danger/30"
                  : "bg-white border-surface-border",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate font-semibold">Câu {idx + 1}</p>
                {hasBlurred && hasAnswered && (
                  <span
                    className={[
                      "text-sm font-bold px-2 py-1 rounded-full",
                      isCorrect
                        ? "bg-success/10 text-success-text"
                        : "bg-danger/10 text-danger-text",
                    ].join(" ")}
                  >
                    {isCorrect ? "✓ Chính xác" : "✗ Chưa đúng"}
                  </span>
                )}
              </div>

              <p className="font-bold text-lg text-slate mb-3">{getPromptText(item)}</p>

              <InputField
                label="Đáp án của bạn"
                placeholder={getPlaceholder(item)}
                value={values[item.id] ?? ""}
                onChange={(e) => handleChange(item.id, e.target.value)}
                onBlur={() => handleBlur(item.id)}
                className={[
                  "transition-colors",
                  hasBlurred && isCorrect ? "border-success" : "",
                  hasBlurred && isCorrect === false ? "border-danger" : "",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="primary" fullWidth disabled={!allFilled} onClick={onNext}>
          {allFilled ? "Tiếp theo →" : "Điền hết để tiếp tục"}
        </Button>
      </div>
    </div>
  );
}
