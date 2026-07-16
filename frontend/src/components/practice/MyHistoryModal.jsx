import React, { useEffect, useState } from "react";
import { Modal, BadgeStatus } from "../ui";
import { fetchMyAttemptHistory } from "../../lib/studentPracticeApi";

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * MyHistoryModal — học sinh xem lịch sử làm bài của chính mình.
 * Props: { sessionId, sessionTitle, isOpen, onClose }
 */
export default function MyHistoryModal({ sessionId, sessionTitle, isOpen, onClose }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    setHistory(null);
    fetchMyAttemptHistory(sessionId).then(setHistory).catch(() => setHistory([]));
  }, [isOpen, sessionId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionTitle ? `Lịch sử làm bài — ${sessionTitle}` : "Lịch sử làm bài"}
      maxWidth="max-w-lg"
    >
      {history === null && (
        <p className="text-sm text-slate/40 text-center py-6">Đang tải lịch sử...</p>
      )}

      {history?.length === 0 && (
        <p className="text-sm text-slate/40 text-center py-6">Bạn chưa làm bài này lần nào.</p>
      )}

      {history && history.length > 0 && (
        <ol className="relative border-l-2 border-pink-100 pl-6 space-y-6">
          {history.map((attempt, idx) => (
            <li key={attempt.id} className="relative">
              <span
                className={[
                  "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white",
                  attempt.passed ? "bg-success" : "bg-danger",
                ].join(" ")}
                aria-hidden="true"
              />

              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <p className="font-bold text-slate">
                  Lần {attempt.attempt_number ?? idx + 1}
                  {attempt.passed && <span className="text-success-text"> (Đạt)</span>}
                </p>
                <BadgeStatus status={attempt.passed ? "completed" : "failed"} />
              </div>

              <p className="text-sm text-slate/60">
                Điểm: <span className="font-bold text-slate">{attempt.score}%</span>
                {" · "}
                <span className="font-bold text-slate">
                  {attempt.correct_count}/{attempt.total_questions}
                </span> câu đúng
                {attempt.duration_seconds != null && (
                  <> · {formatDuration(attempt.duration_seconds)}</>
                )}
                {" · "}
                {formatDateTime(attempt.created_at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}
