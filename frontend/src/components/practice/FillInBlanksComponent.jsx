import React, { useMemo } from "react";
import { Button, InputField } from "../ui";

/**
 * Bài 3 — FillInBlanksComponent
 * Hiển thị câu có chỗ trống (___), học sinh điền đáp án.
 * Dữ liệu từ backend: [{ id, sentence (chứa ___), answer }]
 */
function normalize(str) {
  return (str || "").trim().toLowerCase();
}

export default function FillInBlanksComponent({ items, values, onChange, onNext, onBack }) {
  const getStatus = (item) => {
    const typed = values[item.id];
    if (typed === undefined || typed === "") return "empty";
    return normalize(typed) === normalize(item.answer) ? "correct" : "incorrect";
  };

  const allCorrect = items.every((item) => getStatus(item) === "correct");

  const handleChange = (id, val) => {
    onChange({ ...values, [id]: val });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate/50 text-center">
        Điền {items.length} từ còn thiếu · Đúng{" "}
        {items.filter((i) => getStatus(i) === "correct").length}/{items.length}
      </p>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const status = getStatus(item);

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-surface-border p-4">
              <p className="text-xs text-slate/40 mb-1">Câu {idx + 1}</p>
              <p className="font-bold text-slate mb-3">{item.sentence}</p>
              <InputField
                label="Điền từ vào chỗ trống"
                placeholder="Nhập câu trả lời..."
                value={values[item.id] ?? ""}
                onChange={(e) => handleChange(item.id, e.target.value)}
                error={status === "incorrect" ? "Chưa đúng, thử lại nhé." : undefined}
                className={status === "correct" ? "border-success ring-2 ring-success/20" : ""}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Quay lại
        </Button>
        <Button variant="primary" fullWidth disabled={!allCorrect} onClick={onNext}>
          {allCorrect ? "Tiếp theo →" : "Điền đúng hết để tiếp tục"}
        </Button>
      </div>
    </div>
  );
}
