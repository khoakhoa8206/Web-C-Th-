import { Button } from "@/components/vocab-ui";
import type { ClassRow } from "@/lib/teacher-api";

export function ClassPicker({
  classes,
  value,
  onChange,
  onAddClick,
}: {
  classes: ClassRow[];
  value: string;
  onChange: (v: string) => void;
  onAddClick?: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate/50 mb-1">
        Khối lớp
      </label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
        >
          {classes.length === 0 && (
            <option value="">Chưa có khối lớp</option>
          )}
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {onAddClick && (
          <Button
            type="button"
            variant="secondary"
            className="!h-11 !w-11 shrink-0 !px-0"
            onClick={onAddClick}
            title="Thêm khối lớp"
          >
            +
          </Button>
        )}
      </div>
    </div>
  );
}