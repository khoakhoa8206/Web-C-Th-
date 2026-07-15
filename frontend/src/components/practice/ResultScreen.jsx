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
 * ResultScreen — hiển thị sau khi nộp Bài 4.
 *
 * ĐẠT (>=80%): ăn mừng "HOÀN THÀNH", câu đúng tô xanh, câu sai tô đỏ
 *              KÈM đáp án đúng để học sinh đối chiếu.
 * CHƯA ĐẠT (<80%): nút "LÀM LẠI", CHỈ đánh dấu đỏ ở câu sai — KHÔNG lộ
 *                   đáp án đúng, buộc học sinh tự tìm lại kiến thức.
 */
export default function ResultScreen({ result, pendingSyncNotice, timerSeconds, onRetry, onExit }) {
  const { score, passed, correctCount, total, gradedAnswers, questionsRef } = result;

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <CardContainer className="text-center" tone={passed ? "tinted" : "white"}>
          <p className="text-5xl mb-2">{passed ? "🎉" : "💪"}</p>
          <h1 className="text-2xl font-extrabold text-pink-600 mb-1">
            {passed ? "HOÀN THÀNH" : "CHƯA ĐẠT"}
          </h1>
          <p className="text-slate/60 text-sm mb-4">
            {passed
              ? "Tuyệt vời! Bạn đã nắm vững từ vựng buổi học này."
              : "Cố lên! Xem lại các câu sai và thử làm lại nhé."}
          </p>

          <div className="flex items-center justify-center gap-6 mb-4">
            <div>
              <p className="text-3xl font-extrabold text-slate">{score}%</p>
              <p className="text-xs text-slate/40">Điểm số</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate">
                {correctCount}/{total}
              </p>
              <p className="text-xs text-slate/40">Câu đúng</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate">{formatTime(timerSeconds)}</p>
              <p className="text-xs text-slate/40">Thời gian</p>
            </div>
          </div>

          <BadgeStatus status={passed ? "completed" : "failed"} animate />

          {pendingSyncNotice && (
            <p className="text-xs text-warning-text bg-warning-bg rounded-full px-3 py-1 inline-block mt-3">
              ⏳ Kết quả đang chờ đồng bộ — sẽ tự động gửi khi có mạng
            </p>
          )}
        </CardContainer>

        {/* Chi tiết bài làm */}
        <CardContainer>
          <h2 className="font-bold text-slate mb-4">Chi tiết bài làm</h2>
          <div className="space-y-3">
            {gradedAnswers.map((a, idx) => (
              <div
                key={a.questionId}
                className={[
                  "rounded-xl p-3 border",
                  a.isCorrect
                    ? "bg-success-bg border-success/30"
                    : "bg-danger-bg border-danger/30",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-slate mb-1">Câu {idx + 1}</p>
                <p
                  className={`text-sm ${
                    a.isCorrect ? "text-success-text" : "text-danger-text"
                  }`}
                >
                  {a.isCorrect ? "✓ Chính xác" : "✗ Chưa đúng"}
                  {a.selectedIndex >= 0 &&
                    ` — Bạn chọn: ${OPTION_LABELS[a.selectedIndex]}`}
                </p>

                {/* Chỉ lộ đáp án đúng khi học sinh ĐÃ ĐẠT bài này */}
                {passed && !a.isCorrect && (
                  <p className="text-sm text-success-text mt-1">
                    Đáp án đúng: {OPTION_LABELS[a.correctIndex]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContainer>

        <div className="flex gap-3">
          <Link to="/student" onClick={onExit} className="flex-1">
            <Button variant="ghost" fullWidth>
              Về trang chủ
            </Button>
          </Link>
          {!passed && (
            <Button variant="primary" fullWidth onClick={onRetry}>
              LÀM LẠI
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
