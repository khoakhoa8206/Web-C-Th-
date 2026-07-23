import React from "react";
import { Link } from "react-router-dom";
import { Button, CardContainer, BadgeStatus } from "../ui";

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * ResultScreen v3
 * - Luôn hiện nút "Làm lại bài 4" và "Ôn lại từ vựng" trừ khi đạt 100%
 * - Khi đạt 100%: chỉ có nút Về trang chủ
 */
export default function ResultScreen({
  result,
  pendingSyncNotice,
  timerSeconds,
  onRetry,
  onRetryMcqOnly,
  onExit,
}) {
  const { score, passed, correctCount, total, gradedAnswers } = result;
  const isPerfect = score === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Main Score Card */}
        <CardContainer className="text-center" tone={passed ? "tinted" : "white"}>
          <p className="text-6xl mb-3">{isPerfect ? "🏆" : passed ? "🎉" : "💪"}</p>
          <h1 className="text-4xl font-extrabold text-slate mb-2">
            {isPerfect ? "TUYỆT VỜI!" : passed ? "🎉 HOÀN THÀNH" : "💪 CHƯA ĐẠT"}
          </h1>
          <p className="text-slate text-base mb-6">
            {isPerfect
              ? "Điểm tuyệt đối! Bạn đã nắm vững hoàn toàn từ vựng buổi học này."
              : passed
              ? "Xuất sắc! Kết quả đã được lưu. Bạn có thể thử để đạt điểm cao hơn."
              : "Cố lên! Hãy lựa chọn cách ôn lại phù hợp nhất."}
          </p>

          {/* Score Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-pink-600">{score}%</p>
              <p className="text-sm text-slate mt-1">Điểm số</p>
            </div>
            <div className="text-center border-l border-r border-pink-200">
              <p className="text-5xl font-extrabold text-slate">{correctCount}/{total}</p>
              <p className="text-sm text-slate mt-1">Câu đúng</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-extrabold text-slate">{formatTime(timerSeconds)}</p>
              <p className="text-sm text-slate mt-1">Thời gian</p>
            </div>
          </div>

          <BadgeStatus status={passed ? "completed" : "failed"} animate />

          {pendingSyncNotice && (
            <p className="text-xs text-warning-text bg-warning-bg rounded-full px-3 py-1.5 inline-block mt-4">
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
                  <p className={`text-sm font-medium ${a.isCorrect ? "text-success-text" : "text-danger-text"}`}>
                    {a.isCorrect ? "✓ Chính xác" : "✗ Chưa đúng"}
                    {a.selectedIndex >= 0 && ` — Bạn chọn: ${OPTION_LABELS[a.selectedIndex]}`}
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

        {/* Buttons */}
        <div className="space-y-3">
          {!isPerfect && (
            <>
              {/* Làm lại bài 4 */}
              <button
                onClick={onRetryMcqOnly}
                className={[
                  "w-full px-6 py-4 rounded-2xl font-bold text-base transition-all text-left",
                  "border-2 bg-white border-pink-300 text-slate",
                  "hover:border-pink-500 hover:bg-pink-50 hover:shadow-md active:scale-95 duration-150",
                ].join(" ")}
              >
                🔄 Làm lại bài 4
                <p className="text-sm text-slate/70 mt-1 font-normal">(Chỉ làm lại câu hỏi trắc nghiệm, thời gian tính tiếp)</p>
              </button>

              {/* Ôn lại từ đầu */}
              <button
                onClick={onRetry}
                className={[
                  "w-full px-6 py-4 rounded-2xl font-bold text-base transition-all text-left",
                  "bg-gradient-to-r from-pink-600 to-pink-500 text-white",
                  "hover:shadow-lg hover:from-pink-700 hover:to-pink-600 active:scale-95 duration-150",
                ].join(" ")}
              >
                📚 Ôn lại từ vựng
                <p className="text-sm text-pink-100 mt-1 font-normal">(Từ đầu: Flashcard → Nối từ → Điền từ → Trắc nghiệm)</p>
              </button>
            </>
          )}

          {/* Về trang chủ - luôn hiển thị */}
          <Link to="/student" onClick={onExit} className="block">
            <Button variant="ghost" fullWidth>← Về trang chủ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
