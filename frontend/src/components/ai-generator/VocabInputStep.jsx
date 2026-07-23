import React from "react";
import { Button, CardContainer } from "../ui";

/**
 * Bước 1 — Nhập liệu: giáo viên chọn buổi học đích và dán/gõ danh sách
 * từ vựng (mỗi dòng 1 từ, có thể kèm nghĩa: "word - nghĩa tiếng Việt").
 */
export default function VocabInputStep({
  classes,
  classId,
  onClassChange,
  onAddClass,
  vocabText,
  onVocabTextChange,
  onGenerate,
}) {
  const canGenerate = !!classId && vocabText.trim().length > 0;

  return (
    <CardContainer className="max-w-2xl mx-auto">
      <h2 className="font-bold text-slate text-lg mb-1">Soạn bài bằng AI ✨</h2>
      <p className="text-sm text-slate-900 mb-6">
        Dán danh sách từ vựng, AI sẽ tự dựng sẵn 4 bài tập: Flashcard, Nối từ, Điền từ, Trắc nghiệm.
      </p>

      <div className="mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-900 mb-1">Khối lớp</label>
          <div className="flex gap-2">
            <select
              value={classId ?? ""}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
            >
              <option value="">Chọn lớp học</option>
              {classes.map((klass) => (
                <option key={klass.id} value={klass.id}>
                  {klass.name}
                </option>
              ))}
            </select>
            {onAddClass && (
              <Button
                type="button"
                variant="secondary"
                className="!h-11 !w-11 shrink-0 !px-0"
                onClick={onAddClass}
                title="Thêm khối lớp"
              >
                +
              </Button>
            )}
          </div>
        </div>
      </div>

      <label className="block text-sm font-semibold text-slate mb-1.5">Danh sách từ vựng</label>
      <textarea
        value={vocabText}
        onChange={(e) => onVocabTextChange(e.target.value)}
        rows={8}
        placeholder={"Family - Gia đình\nFriend - Bạn bè\nSchool - Trường học\n..."}
        className="w-full rounded-2xl border border-surface-border bg-white p-4 text-sm text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 resize-none font-mono"
      />
      <p className="text-xs text-slate-900 mt-1.5">
        Mỗi dòng 1 từ, định dạng gợi ý: <code>word - nghĩa tiếng Việt</code>
      </p>

      <Button variant="primary" fullWidth className="mt-6" disabled={!canGenerate} onClick={onGenerate}>
        🪄 Tạo bài học bằng AI
      </Button>
    </CardContainer>
  );
}
