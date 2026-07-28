import React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useSessionExercises } from "../hooks/useSessionVocab";
import PracticeFlow from "../components/practice/PracticeFlow";
import VocabReviewStep from "../components/practice/VocabReviewStep";

/**
 * PracticeSessionPage
 * ?review=1 → chỉ hiển thị màn hình ôn từ vựng, không cho làm bài
 *             (dùng khi quá hạn — học sinh vẫn xem được từ vựng bài cũ)
 */
export default function PracticeSessionPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const isReviewOnly = searchParams.get("review") === "1";

  const { data: exercises, isLoading, isError, error } = useSessionExercises(sessionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-slate/70 text-sm">Đang tải bài tập...</p>
      </div>
    );
  }

  if (isError || !exercises) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-danger-text font-semibold">
          Không thể tải dữ liệu bài tập. {error?.message}
        </p>
        <Link to="/student" className="text-pink-600 text-sm font-semibold">
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  // Chế độ xem lại từ vựng (quá hạn): chỉ hiện flashcard vocab, không cho làm bài
  if (isReviewOnly) {
    const vocabList = (exercises.flashcards || []).map((f) => ({
      id: f.id,
      word: f.word,
      meaning: f.meaning,
      phonetic: f.phonetic || "",
      word_type: f.word_type || "",
    }));

    return (
      <div>
        <div className="px-4 pt-4 max-w-2xl mx-auto">
          <Link to="/student/sessions" className="text-xs text-pink-600 font-semibold">
            ← Quay lại danh sách bài
          </Link>
          <div className="mt-2 mb-1 text-xs text-danger-text bg-danger-bg rounded-xl px-3 py-1.5 inline-block font-semibold">
            🔒 Bài tập đã hết hạn — chỉ xem lại từ vựng
          </div>
        </div>
        <VocabReviewStep
          vocabList={vocabList}
          onReady={null}
          stepError={null}
          reviewOnly
        />
      </div>
    );
  }

  return <PracticeFlow sessionId={sessionId} exercises={exercises} />;
}
