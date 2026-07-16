import React from "react";
import { Button, InputField } from "../ui";

/**
 * Bài 3 — FillInBlanksComponent
 * Hiển thị câu có chỗ trống (___), học sinh điền đáp án.
 * Dữ liệu từ backend: [{ id, sentence (chứa ___), answer }]
 * Mục 6: Không chấm đúng/sai theo thời gian thực — chỉ theo dõi đã điền hay chưa.
 */

export default function FillInBlanksComponent({ items, values, onChange, onNext, onBack }) {
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
        Điền {items.length} từ còn thiếu · Đã điền {filledCount}/{items.length}
      </p>

      <div className="space-y-4">
        {items.map((item, idx) => {
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-surface-border p-4">
              <p className="text-xs text-slate/40 mb-1">Câu {idx + 1}</p>
              <p className="font-bold text-slate mb-3">{item.sentence}</p>
              <InputField
                label="Điền từ vào chỗ trống"
                placeholder="Nhập câu trả lời..."
                value={values[item.id] ?? ""}
                onChange={(e) => handleChange(item.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button variant="primary" fullWidth disabled={!allFilled} onClick={onNext}>
          {allFilled ? "Tiếp theo →" : "Điền hết để tiếp tục"}
        </Button>
      </div>
    </div>
  );
}
