import { Button, InputField } from "@/components/vocab-ui";
import type { ExercisesPayload } from "@/lib/student-api";

type FillItem = ExercisesPayload["fill_in_blanks"][number];

function getPromptText(item: FillItem) {
  return item.direction === "vi_to_en"
    ? `Từ tiếng Anh nào có nghĩa là "${item.word}"?`
    : `"${item.word}" có nghĩa là gì?`;
}
function getPlaceholder(item: FillItem) {
  return item.direction === "vi_to_en"
    ? "Gõ từ tiếng Anh..."
    : "Gõ nghĩa tiếng Việt...";
}

export interface FillInBlanksProps {
  items: FillItem[];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  onNext: () => void;
}

export function FillInBlanksComponent({
  items,
  values,
  onChange,
  onNext,
}: FillInBlanksProps) {
  const isFilled = (item: FillItem) => {
    const typed = values[item.id];
    return typed !== undefined && typed.trim() !== "";
  };
  const filledCount = items.filter(isFilled).length;
  const allFilled = filledCount === items.length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate/50 text-center">
        Điền {items.length} từ vựng · Đã điền {filledCount}/{items.length}
      </p>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-surface-border p-4"
          >
            <p className="text-xs text-slate/40 mb-1">Câu {idx + 1}</p>
            <p className="font-semibold text-slate mb-2">
              {getPromptText(item)}
            </p>
            <InputField
              label="Đáp án của bạn"
              placeholder={getPlaceholder(item)}
              value={values[item.id] ?? ""}
              onChange={(e) =>
                onChange({ ...values, [item.id]: e.target.value })
              }
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="primary" fullWidth disabled={!allFilled} onClick={onNext}>
          {allFilled ? "Tiếp theo →" : "Điền hết để tiếp tục"}
        </Button>
      </div>
    </div>
  );
}