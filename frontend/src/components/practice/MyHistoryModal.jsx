import React, { useEffect, useState } from "react";
import { Modal, BadgeStatus } from "../ui";
import { fetchMyAttemptHistory, fetchAttemptDetail } from "../../lib/studentPracticeApi";

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
  const [expandedId, setExpandedId] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    setHistory(null);
    setExpandedId(null);
    setDetailCache({});
    fetchMyAttemptHistory(sessionId).then(setHistory).catch(() => setHistory([]));
  }, [isOpen, sessionId]);

  const handleToggleDetail = async (attemptId) => {
    if (expandedId === attemptId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(attemptId);
    if (detailCache[attemptId]) return; // đã có cache
    setLoadingDetailId(attemptId);
    try {
      const data = await fetchAttemptDetail(attemptId);
      setDetailCache((prev) => ({ ...prev, [attemptId]: data }));
    } catch {
      /* bỏ qua */
    } finally {
      setLoadingDetailId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionTitle ? `Lịch sử làm bài — ${sessionTitle}` : "Lịch sử làm bài"}
      maxWidth="max-w-lg"
    >
      {history === null && (
        <p className="text-sm text-slate/70 text-center py-6">Đang tải lịch sử...</p>
      )}

      {history?.length === 0 && (
        <p className="text-sm text-slate/70 text-center py-6">Bạn chưa làm bài này lần nào.</p>
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

              <button
                className="text-xs text-pink-600 hover:underline mt-1"
                onClick={() => handleToggleDetail(attempt.id)}
              >
                {expandedId === attempt.id ? "Ẩn chi tiết ▴" : "Xem chi tiết ▾"}
              </button>

              {expandedId === attempt.id && (
                <div className="mt-3 bg-surface-soft rounded-xl p-3">
                  {loadingDetailId === attempt.id && (
                    <p className="text-xs text-slate/70">Đang tải…</p>
                  )}
                  {detailCache[attempt.id] && !detailCache[attempt.id].can_view_detail && (
                    <p className="text-xs text-slate/60">
                      Hãy làm lại và đạt ≥80% để xem đáp án.
                    </p>
                  )}
                  {detailCache[attempt.id]?.can_view_detail && (
                    <div className="space-y-2">
                      {(detailCache[attempt.id].details || []).map((d, i) => (
                        <div
                          key={d.id || i}
                          className={`rounded-lg px-3 py-2 text-xs ${
                            d.is_correct
                              ? "bg-success-bg text-success-text"
                              : "bg-danger-bg text-danger-text"
                          }`}
                        >
                          <p className="font-semibold">
                            {d.term || d.word || d.question}
                          </p>
                          <p>
                            Bạn trả lời:{" "}
                            <span className="font-bold">{d.student_answer || "(bỏ trống)"}</span>
                          </p>
                          {!d.is_correct && (
                            <p>
                              Đáp án đúng:{" "}
                              <span className="font-bold">
                                {d.correct_answer || d.correct_answer_id}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}
