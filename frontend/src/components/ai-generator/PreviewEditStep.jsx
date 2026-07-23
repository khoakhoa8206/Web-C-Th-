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

function fmtDatetime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

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
  onSchedule,     // (scheduledAt, deadline) => void — hẹn giờ giao bài (mục 5)
  isSaving,
  savedStatus,
  publishDeadline = "",
  onDeadlineChange,
}) {
  const [activeTab, setActiveTab] = useState("flashcards");
  const [confirmedDeadline, setConfirmedDeadline] = useState("");

  // Publish mode: giao ngay hoặc hẹn giờ (mục 5)
  const [publishMode, setPublishMode] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [confirmedScheduledAt, setConfirmedScheduledAt] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const handleScheduleClick = () => {
    setScheduleError("");
    if (!scheduledAt) {
      setScheduleError("Vui lòng chọn thời điểm sẽ tự động giao bài.");
      return;
    }
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      setScheduleError("Thời điểm hẹn phải ở tương lai.");
      return;
    }
    onSchedule?.(scheduledAt, publishDeadline || null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CardContainer className="mb-4">
        <h2 className="font-bold text-slate text-lg mb-1">Xem trước & Chỉnh sửa</h2>
        <p className="text-sm text-slate-600 mb-4">
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
            savedStatus === "PUBLISHED" ? "text-success-text"
            : savedStatus === "SCHEDULED" ? "text-blue-600"
            : "text-slate-700"
          }`}
        >
          {savedStatus === "PUBLISHED"
            ? "✓ Đã giao bài tập cho học sinh!"
            : savedStatus === "SCHEDULED"
            ? `🕐 Đã đặt lịch hẹn giờ giao bài lúc ${fmtDatetime(scheduledAt)}.`
            : "✓ Đã lưu bản nháp."}
        </p>
      )}

      {/* Hạn nộp bài + chế độ giao bài */}
      {onDeadlineChange && (
        <CardContainer className="mb-4 space-y-4">
          {/* Mode chọn cách giao */}
          <div>
            <p className="text-sm font-semibold text-slate mb-2">Cách giao bài</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setPublishMode("now"); setScheduleError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  publishMode === "now"
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-white text-slate border-surface-border hover:border-pink-300"
                }`}
              >
                🚀 Giao ngay
              </button>
              <button
                type="button"
                onClick={() => { setPublishMode("schedule"); setScheduleError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  publishMode === "schedule"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate border-surface-border hover:border-blue-300"
                }`}
              >
                🕐 Hẹn giờ giao
              </button>
            </div>
          </div>

          {/* Hẹn giờ giao bài */}
          {publishMode === "schedule" && (
            <div className="flex flex-col gap-1.5 p-3 bg-blue-50 rounded-2xl">
              <label className="text-sm font-semibold text-slate">Thời điểm tự động giao bài</label>
              <input
                type="datetime-local"
                className="w-full h-11 rounded-2xl bg-white border border-blue-200 px-4 text-slate text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                value={scheduledAt}
                onChange={(e) => { setScheduledAt(e.target.value); setScheduleError(""); }}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                  onClick={() => setConfirmedScheduledAt(scheduledAt)}
                >
                  ✓ Xác nhận giờ hẹn
                </button>
              </div>
              {confirmedScheduledAt && confirmedScheduledAt === scheduledAt && (
                <span className="inline-flex w-fit items-center text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-3 py-1">
                  Sẽ giao lúc: {fmtDatetime(confirmedScheduledAt)} ✓
                </span>
              )}
              {scheduleError && (
                <p className="text-xs text-danger-text">{scheduleError}</p>
              )}
              <p className="text-xs text-slate-600">Hệ thống sẽ tự động giao bài đúng vào thời điểm này.</p>
            </div>
          )}

          {/* Hạn nộp bài (chung cho cả 2 chế độ) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate">🗓 Hạn nộp bài (tuỳ chọn)</label>
            <input
              type="datetime-local"
              className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
              value={publishDeadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="text-xs font-semibold text-pink-600 hover:underline"
                onClick={() => setConfirmedDeadline(publishDeadline)}
              >
                ✓ Xác nhận deadline
              </button>
              {publishDeadline && (
                <button
                  type="button"
                  className="text-xs text-slate-600 hover:text-danger-text"
                  onClick={() => { onDeadlineChange(""); setConfirmedDeadline(""); }}
                >
                  ✕ Xoá deadline
                </button>
              )}
            </div>
            {confirmedDeadline && confirmedDeadline === publishDeadline && (
              <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-success-text bg-success-bg rounded-full px-3 py-1">
                Đã chọn: {fmtDatetime(confirmedDeadline)} ✓
              </span>
            )}
            <p className="text-xs text-slate-600">
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
          {isSaving === "DRAFT" ? "Đang lưu nháp..." : "💾 Lưu bản nháp"}
        </Button>
        {publishMode === "now" ? (
          <Button
            variant="primary"
            fullWidth
            isLoading={isSaving === "PUBLISHED"}
            disabled={!!isSaving}
            onClick={onPublish}
          >
            {isSaving === "PUBLISHED" ? "Đang giao bài..." : "🚀 Giao bài tập ngay"}
          </Button>
        ) : (
          <Button
            variant="primary"
            fullWidth
            isLoading={isSaving === "SCHEDULED"}
            disabled={!!isSaving}
            onClick={handleScheduleClick}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSaving === "SCHEDULED" ? "Đang đặt lịch..." : "🕐 Đặt lịch hẹn giờ"}
          </Button>
        )}
      </div>
    </div>
  );
}
