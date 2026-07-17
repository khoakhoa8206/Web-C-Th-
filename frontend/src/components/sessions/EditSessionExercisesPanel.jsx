import React, { useEffect, useState } from "react";
import { Tabs, Button, CardContainer } from "../ui";
import FlashcardEditTab from "../ai-generator/tabs/FlashcardEditTab";
import MatchUpEditTab from "../ai-generator/tabs/MatchUpEditTab";
import FillInBlanksEditTab from "../ai-generator/tabs/FillInBlanksEditTab";
import MCQEditTab from "../ai-generator/tabs/MCQEditTab";
import { fetchSessionExercises, updateSessionExercises } from "../../lib/sessionsApi";

const EXERCISE_TABS = [
  { id: "flashcards", label: "Flashcard", icon: "🃏" },
  { id: "matchup", label: "Nối từ", icon: "🔗" },
  { id: "fillblanks", label: "Điền từ", icon: "✏️" },
  { id: "mcq", label: "Trắc nghiệm", icon: "☑️" },
];

/**
 * EditSessionExercisesPanel — màn hình toàn màn hình để giáo viên sửa trực tiếp
 * nội dung 4 loại bài tập (flashcards, match_up, fill_in_blanks, mcqs) của MỘT
 * session bất kể trạng thái DRAFT hay PUBLISHED (mục 7 trong FIX_REQUESTS).
 *
 * Tách biệt với "Sửa" (openEdit trong ManageSessionsPage) — nút đó chỉ sửa
 * tên/deadline; panel này chỉ sửa NỘI DUNG bài tập.
 */
export default function EditSessionExercisesPanel({ sessionId, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState("flashcards");
  const [lessonData, setLessonData] = useState(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionStatus, setSessionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError("");
    fetchSessionExercises(sessionId)
      .then((data) => {
        if (cancelled) return;
        setLessonData({
          flashcards: data.flashcards,
          matchup: data.matchup,
          fillblanks: data.fillblanks,
          mcq: data.mcq,
        });
        setSessionTitle(data.session_title);
        setSessionStatus(data.status);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Không thể tải nội dung bài tập.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleChangeSection = (section, items) => {
    setLessonData((prev) => ({ ...prev, [section]: items }));
    setSavedOk(false);
  };

  const handleSave = async () => {
    if (isSaving || !lessonData) return;
    setIsSaving(true);
    setSaveError("");
    setSavedOk(false);
    try {
      await updateSessionExercises(sessionId, lessonData);
      setSavedOk(true);
      onSaved?.();
    } catch (err) {
      setSaveError(err.message || "Không thể lưu thay đổi nội dung bài tập.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-surface-soft overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate/40 hover:text-pink-600 mb-1"
            >
              ← Quay lại danh sách bài tập
            </button>
            <h2 className="font-extrabold text-slate text-lg truncate">
              Sửa nội dung: {sessionTitle || "..."}
            </h2>
          </div>
        </div>

        {sessionStatus === "PUBLISHED" && (
          <p className="text-sm text-warning-text bg-warning-bg rounded-xl px-4 py-2 mb-4">
            ⚠️ Bài này đã giao cho học sinh, thay đổi sẽ áp dụng cho học sinh chưa nộp bài.
          </p>
        )}

        {isLoading && <p className="text-sm text-slate/50">Đang tải nội dung bài tập...</p>}
        {loadError && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2 mb-4">
            {loadError}
          </p>
        )}

        {!isLoading && lessonData && (
          <>
            <CardContainer className="mb-4">
              <Tabs items={EXERCISE_TABS} activeId={activeTab} onChange={setActiveTab} />
            </CardContainer>

            <CardContainer className="mb-4">
              {activeTab === "flashcards" && (
                <FlashcardEditTab
                  items={lessonData.flashcards}
                  onChange={(items) => handleChangeSection("flashcards", items)}
                />
              )}
              {activeTab === "matchup" && (
                <MatchUpEditTab
                  items={lessonData.matchup}
                  onChange={(items) => handleChangeSection("matchup", items)}
                />
              )}
              {activeTab === "fillblanks" && (
                <FillInBlanksEditTab
                  items={lessonData.fillblanks}
                  onChange={(items) => handleChangeSection("fillblanks", items)}
                />
              )}
              {activeTab === "mcq" && (
                <MCQEditTab
                  items={lessonData.mcq}
                  onChange={(items) => handleChangeSection("mcq", items)}
                />
              )}
            </CardContainer>

            {saveError && (
              <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2 mb-3 text-center">
                {saveError}
              </p>
            )}
            {savedOk && (
              <p className="text-sm text-success-text text-center mb-3 font-semibold">
                ✓ Đã lưu thay đổi nội dung bài tập.
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={onClose}>
                Đóng
              </Button>
              <Button variant="primary" fullWidth isLoading={isSaving} onClick={handleSave}>
                💾 Lưu thay đổi nội dung bài tập
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
