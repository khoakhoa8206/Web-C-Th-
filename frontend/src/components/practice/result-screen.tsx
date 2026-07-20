import { Link } from "@tanstack/react-router";
import { Button, CardContainer, BadgeStatus } from "@/components/vocab-ui";
import { cn } from "@/lib/utils";

export interface GradedAnswer {
  questionId: string;
  isCorrect: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  selectedIndex?: number;
  correctIndex?: number;
  type?: string;
  question?: string;
}

export interface PracticeResult {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  gradedAnswers: GradedAnswer[];
  pending?: boolean;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ResultScreen({
  result,
  pendingSyncNotice,
  timerSeconds,
  onRetry,
  onExit,
}: {
  result: PracticeResult;
  pendingSyncNotice: boolean;
  timerSeconds: number;
  onRetry: () => void;
  onExit: () => void;
}) {
  const { score, passed, correctCount, total, gradedAnswers } = result;
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
              : "Cố lên! Ôn lại từ vựng và thử làm lại để đạt từ 80% trở lên."}
          </p>
          <div className="flex items-center justify-center gap-6 mb-4">
            <div>
              <p className="text-3xl font-extrabold text-slate">{score}%</p>
              <p className="text-xs text-slate/40">Điểm số</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate">{correctCount}/{total}</p>
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

        {passed && gradedAnswers && gradedAnswers.length > 0 && (
          <CardContainer>
            <h2 className="font-bold text-slate mb-4">Chi tiết bài làm</h2>
            <div className="space-y-3">
              {gradedAnswers.map((a, idx) => (
                <div
                  key={a.questionId}
                  className={cn(
                    "rounded-xl p-3 border",
                    a.isCorrect
                      ? "bg-success-bg border-success/30"
                      : "bg-danger-bg border-danger/30",
                  )}
                >
                  <p className="text-sm font-semibold text-slate mb-1">Câu {idx + 1}</p>
                  <p className={cn("text-sm", a.isCorrect ? "text-success-text" : "text-danger-text")}>
                    {a.isCorrect ? "✓ Chính xác" : "✗ Chưa đúng"}
                    {a.selectedAnswer && ` — Bạn chọn: ${a.selectedAnswer}`}
                  </p>
                  {!a.isCorrect && a.correctAnswer && (
                    <p className="text-sm text-success-text mt-1">
                      Đáp án đúng: {a.correctAnswer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContainer>
        )}

        {!passed && (
          <p className="text-sm text-slate/60 text-center">
            Bạn cần đạt từ 80% trở lên để xem chi tiết đáp án. Hãy làm lại nhé!
          </p>
        )}

        <div className="flex gap-3">
          <Link to="/student" onClick={onExit} className="flex-1">
            <Button variant="ghost" fullWidth>Về trang chủ</Button>
          </Link>
          {!passed && (
            <Button variant="primary" fullWidth onClick={onRetry}>LÀM LẠI</Button>
          )}
        </div>
      </div>
    </div>
  );
}