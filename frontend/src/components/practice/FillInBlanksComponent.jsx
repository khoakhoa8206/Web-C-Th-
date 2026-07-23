import React, { useState, useMemo } from "react";
import { Button, InputField } from "../ui";

/**
 * Bài 3 — FillInBlanksComponent v2
 * Learning Mode: Hiển thị immediate feedback (đáp án đúng ngay lập tức)
 * 
 * Improvements:
 * 1. Instant feedback: Sau mỗi keystroke, kiểm tra nếu đúng/sai
 * 2. Show correct answer ngay khi sai
 * 3. Cho phép học sinh tiếp tục sửa (không chặn)
 * 4. Visual feedback: Badges, colors, animations
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
  const answers = correctAnswers.split("|").map(a => a.trim().toLowerCase());
  
  return answers.some(ans => ans === normalized);
}

export default function FillInBlanksComponent({ items, values, onChange, onNext }) {
  // Feedback state: { [itemId]: { isCorrect: bool, correctAnswer: string } }
  const [feedback, setFeedback] = useState({});

  const isFilled = (item) => {
    const typed = values[item.id];
    return typed !== undefined && typed.trim() !== "";
  };

  const filledCount = items.filter(isFilled).length;
  const allFilled = filledCount === items.length;

  // Tính toán memoized: số câu trả lời đúng
  const correctCount = useMemo(() => {
    return items.filter((item) => {
      const result = checkAnswer(values[item.id], item.correct_answer || item.answer || "");
      return result === true;
    }).length;
  }, [items, values]);

  const handleChange = (id, val) => {
    onChange({ ...values, [id]: val });

    // Instant feedback: kiểm tra ngay khi user gõ
    if (val.trim()) {
      const item = items.find(i => i.id === id);
      const isCorrect = checkAnswer(val, item.correct_answer || item.answer || "");
      
      setFeedback((prev) => ({
        ...prev,
        [id]: {
          isCorrect,
          correctAnswer: item.correct_answer || item.answer || "",
        },
      }));
    } else {
      // Clear feedback nếu xoá trắng
      setFeedback((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-600 text-center">
          Điền {items.length} từ vựng (Bài học — xem đáp án ngay) · Đã điền {filledCount}/{items.length}
        </p>
        <p className="text-sm text-center text-success-text font-semibold">
          ✓ Trả lời đúng: {correctCount}/{items.length}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const itemFeedback = feedback[item.id];
          const isCorrect = itemFeedback?.isCorrect;
          const hasAnswered = isFilled(item);

          return (
            <div
              key={item.id}
              className={[
                "rounded-2xl border-2 p-4 transition-all duration-200 animate-fade-in-scale",
                hasAnswered && isCorrect
                  ? "bg-success-bg border-success/30"
                  : hasAnswered && isCorrect === false
                  ? "bg-danger-bg border-danger/30"
                  : "bg-white border-surface-border",
              ].join(" ")}
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600 font-semibold">Câu {idx + 1}</p>
                {hasAnswered && (
                  <span
                    className={[
                      "text-xs font-bold px-2 py-1 rounded-full animate-pop-in",
                      isCorrect
                        ? "bg-success/10 text-success-text"
                        : isCorrect === false
                        ? "bg-danger/10 text-danger-text"
                        : "",
                    ].join(" ")}
                  >
                    {isCorrect ? "✓ Chính xác" : isCorrect === false ? "✗ Chưa đúng" : ""}
                  </span>
                )}
              </div>

              <p className="font-semibold text-slate mb-3">{getPromptText(item)}</p>

              <InputField
                label="Đáp án của bạn"
                placeholder={getPlaceholder(item)}
                value={values[item.id] ?? ""}
                onChange={(e) => handleChange(item.id, e.target.value)}
                className={[
                  "transition-colors",
                  hasAnswered && isCorrect ? "border-success" : "",
                  hasAnswered && isCorrect === false ? "border-danger" : "",
                ].join(" ")}
              />

              {/* Show correct answer nếu sai */}
              {hasAnswered && isCorrect === false && itemFeedback?.correctAnswer && (
                <div className="mt-2 p-2 bg-success/5 rounded-lg border border-success/20">
                  <p className="text-xs text-success-text font-semibold">
                    Đáp án đúng: <span className="font-bold">{itemFeedback.correctAnswer}</span>
                  </p>
                </div>
              )}
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
