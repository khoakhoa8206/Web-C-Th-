import React, { useState } from "react";
import { Tabs, Button, CardContainer } from "../ui";
import FlashcardEditTab from "./tabs/FlashcardEditTab";
import MatchUpEditTab from "./tabs/MatchUpEditTab";
import FillInBlanksEditTab from "./tabs/FillInBlanksEditTab";
import MCQEditTab from "./tabs/MCQEditTab";

const EXERCISE_TABS = [
  { id: "flashcards", label: "Flashcard", icon: "🃏" },
  { id: "matchup", label: "Nối từ", icon: "🔗" },
  { id: "fillblanks", label: "Điền từ", icon: "✏️" },
  { id: "mcq", label: "Trắc nghiệm", icon: "☑️" },
];

/**
 * Bước 3+4 — Xem trước & Sửa trực tiếp, sau đó Kích hoạt (Lưu nháp / Giao bài).
 * lessonData: { flashcards, matchup, fillblanks, mcq } — chỉnh trực tiếp qua
 * các ô input trong từng tab con (inline edit).
 */
export default function PreviewEditStep({
  lessonData,
  onChangeSection,
  onSaveDraft,
  onPublish,
  isSaving,
  savedStatus,
  publishDeadline = "",
  onDeadlineChange,
}) {
  const [activeTab, setActiveTab] = useState("flashcards");

  return (
    <div className="max-w-3xl mx-auto">
      <CardContainer className="mb-4">
        <h2 className="font-bold text-slate text-lg mb-1">Xem trước & Chỉnh sửa</h2>
        <p className="text-sm text-slate/50 mb-4">
          Click trực tiếp vào từng ô để sửa nội dung AI vừa tạo trước khi giao cho học sinh.
        </p>
        <Tabs items={EXERCISE_TABS} activeId={activeTab} onChange={setActiveTab} />
      </CardContainer>

      <CardContainer className="mb-4">
        {activeTab === "flashcards" && (
          <FlashcardEditTab
            items={lessonData.flashcards}
            onChange={(items) => onChangeSection("flashcards", items)}
          />
        )}
        {activeTab === "matchup" && (
          <MatchUpEditTab
            items={lessonData.matchup}
            onChange={(items) => onChangeSection("matchup", items)}
          />
        )}
        {activeTab === "fillblanks" && (
          <FillInBlanksEditTab
            items={lessonData.fillblanks}
            onChange={(items) => onChangeSection("fillblanks", items)}
          />
        )}
        {activeTab === "mcq" && (
          <MCQEditTab items={lessonData.mcq} onChange={(items) => onChangeSection("mcq", items)} />
        )}
      </CardContainer>

      {savedStatus && (
        <p
          className={`text-sm text-center mb-3 font-semibold ${
            savedStatus === "PUBLISHED" ? "text-success-text" : "text-slate/60"
          }`}
        >
          {savedStatus === "PUBLISHED"
            ? "✓ Đã giao bài tập cho học sinh!"
            : "✓ Đã lưu bản nháp."}
        </p>
      )}

      {/* Input deadline tuỳ chọn */}
      {onDeadlineChange && (
        <CardContainer className="mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate">
              🗓 Hạn nộp bài (tuỳ chọn)
            </label>
            <input
              type="datetime-local"
              className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
              value={publishDeadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
            />
            <p className="text-xs text-slate/40">
              Nếu để trống, học sinh có thể làm bài không giới hạn thời gian. Có thể đặt deadline sau ở tab "Quản lý bài tập".
            </p>
          </div>
        </CardContainer>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          isLoading={isSaving === "DRAFT"}
          disabled={!!isSaving}
          onClick={onSaveDraft}
        >
          💾 Lưu bản nháp
        </Button>
        <Button
          variant="primary"
          fullWidth
          isLoading={isSaving === "PUBLISHED"}
          disabled={!!isSaving}
          onClick={onPublish}
        >
          🚀 Giao bài tập ngay
        </Button>
      </div>
    </div>
  );
}
