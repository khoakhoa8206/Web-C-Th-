import React from "react";
import { Button, InputField } from "../ui";

/**
 * Bài 3 — FillInBlanksComponent
 * Hỏi trực tiếp về 1 từ vựng lấy ngẫu nhiên từ vocab (cùng nguồn với Bài 2 — Match-up).
 * Ngẫu nhiên hỏi theo 1 trong 2 chiều Anh→Việt hoặc Việt→Anh.
 * Dữ liệu từ backend: [{ id, direction: "en_to_vi" | "vi_to_en", word, answer }]
 * `answer` có thể là nhiều đáp án hợp lệ cách nhau bằng dấu `|`.
 * Không chấm đúng/sai theo thời gian thực — chỉ theo dõi đã điền hay chưa.
 */

function getPromptText(item) {
  if (item.direction === "vi_to_en") {
    return `Từ tiếng Anh nào có nghĩa là "${item.word}"?`;
  }
  // mặc định en_to_vi
  return `"${item.word}" có nghĩa là gì?`;
}

function getPlaceholder(item) {
  return item.direction === "vi_to_en"
    ? "Gõ từ tiếng Anh..."
    : "Gõ nghĩa tiếng Việt...";
}

export default function FillInBlanksComponent({ items, values, onChange, onNext }) {
  const isFilled = (item) => {
    const typed = values[item.id];
    return typed !== undefined && typed.trim() !== "";
  };

  const filledCount = items.filter(isFilled).length;
  const allFilled = filledCount === items.length;

  const handleChange = (id, val) => {
    onChange({ ...values, [id]: val });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate/50 text-center">
        Điền {items.length} từ vựng · Đã điền {filledCount}/{items.length}
      </p>

      <div className="space-y-4">
        {items.map((item, idx) => {
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-surface-border p-4">
              <p className="text-xs text-slate/40 mb-1">Câu {idx + 1}</p>
              <p className="font-semibold text-slate mb-2">{getPromptText(item)}</p>
              <InputField
                label="Đáp án của bạn"
                placeholder={getPlaceholder(item)}
                value={values[item.id] ?? ""}
                onChange={(e) => handleChange(item.id, e.target.value)}
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
