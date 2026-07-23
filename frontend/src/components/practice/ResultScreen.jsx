import React from "react";
import { Link } from "react-router-dom";
import { Button, CardContainer, BadgeStatus } from "../ui";

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * ResultScreen v2 — hiển thị sau khi nộp Bài 4.
 *
 * ĐẠT (>=80%): ăn mừng "HOÀN THÀNH", hiển thị chi tiết từng câu đúng/sai
 *              kèm đáp án đúng để học sinh đối chiếu.
 * 
 * CHƯA ĐẠT (<80%): 2 tuỳ chọn retry:
 *                   1. "Làm lại bài 4" (MCQ-only): Chỉ làm lại câu hỏi trắc nghiệm
 *                   2. "Ôn lại từ vựng" (Full restart): Reset toàn bộ từ step 1
 */
export default function ResultScreen({
  result,
  pendingSyncNotice,
  timerSeconds,
  onRetry,
  onRetryMcqOnly,
  onExit,
}) {
  const { score, passed, correctCount, total, gradedAnswers, questionsRef } = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Main Score Card */}
        <CardContainer className="text-center animate-fade-in-scale" tone={passed ? "tinted" : "white"}>
          <p className="text-6xl mb-3 animate-bounce">{passed ? "🎉" : "💪"}</p>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent mb-2">
            {passed ? "HOÀN THÀNH" : "CHƯA ĐẠT"}
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            {passed
              ? "Tuyệt vời! Bạn đã nắm vững từ vựng buổi học này."
              : "Cố lên! Hãy làm lại để đạt điểm cao hơn."}
          </p>

          {/* Score Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-pink-600">{score}%</p>
              <p className="text-sm text-slate-600 mt-1">Điểm số</p>
            </div>
            <div className="text-center border-l border-r border-pink-200">
              <p className="text-3xl font-extrabold text-slate">
                {correctCount}/{total}
              </p>
              <p className="text-sm text-slate-600 mt-1">Câu đúng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-slate">{formatTime(timerSeconds)}</p>
              <p className="text-sm text-slate-600 mt-1">Thời gian</p>
            </div>
          </div>

          <BadgeStatus status={passed ? "completed" : "failed"} animate />

          {pendingSyncNotice && (
            <p className="text-sm text-warning-text bg-warning-bg rounded-full px-3 py-1.5 inline-block mt-4">
              ⏳ Kết quả đang chờ đồng bộ — sẽ tự động gửi khi có mạng
            </p>
          )}
        </CardContainer>

        {/* Chi tiết bài làm — chỉ hiện khi đạt */}
        {passed && gradedAnswers && gradedAnswers.length > 0 && (
          <CardContainer>
            <h2 className="font-bold text-slate mb-4 text-lg">📋 Chi tiết bài làm</h2>
            <div className="space-y-3">
              {gradedAnswers.map((a, idx) => (
                <div
                  key={a.questionId}
                  className={[
                    "rounded-xl p-4 border-2 transition-all",
                    a.isCorrect
                      ? "bg-success-bg border-success/30"
                      : "bg-danger-bg border-danger/30",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-slate mb-2">Câu {idx + 1}</p>
                  <p
                    className={`text-sm font-medium ${
                      a.isCorrect ? "text-success-text" : "text-danger-text"
                    }`}
                  >
                    {a.isCorrect ? "✓ Chính xác" : "✗ Chưa đúng"}
                    {a.selectedIndex >= 0 &&
                      ` — Bạn chọn: ${OPTION_LABELS[a.selectedIndex]}`}
                  </p>

                  {!a.isCorrect && (
                    <p className="text-sm text-success-text mt-2 font-semibold">
                      Đáp án đúng: {a.correctAnswer || (a.correctIndex >= 0 ? OPTION_LABELS[a.correctIndex] : "")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContainer>
        )}

        {!passed && (
          <CardContainer tone="white" className="animate-fade-in-up">
            <h2 className="font-bold text-slate mb-3">📚 Ôn lại bài làm</h2>
            <p className="text-sm text-slate-600 mb-4">
              Bạn cần đạt 80% trở lên. Hãy làm lại các câu hỏi trắc nghiệm để cải thiện điểm:
            </p>
          </CardContainer>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {!passed && (
            /* Not Passed: Only Retry MCQ */
            <button
              onClick={onRetryMcqOnly}
              className={[
                "w-full px-6 py-4 rounded-2xl font-semibold text-sm transition-all",
                "bg-gradient-to-r from-pink-600 to-pink-500 text-white",
                "hover:shadow-lg hover:from-pink-700 hover:to-pink-600",
                "active:scale-95 duration-150 animate-fade-in-up",
              ].join(" ")}
            >
              <span className="text-lg">🔄</span> Làm lại bài 4
              <p className="text-xs text-pink-100 mt-1">(Làm lại câu hỏi trắc nghiệm)</p>
            </button>
          )}

          {/* Home Button - Always visible */}
          <Link to="/student" onClick={onExit} className="block animate-fade-in-up">
            <Button variant="ghost" fullWidth>
              ← Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
