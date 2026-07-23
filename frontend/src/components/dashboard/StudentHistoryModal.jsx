import React, { useEffect, useState } from "react";
import { Modal, BadgeStatus } from "../ui";
import { fetchStudentHistory } from ".. ./lib/attemptsApi";

function formatDuration(seconds) {
  const m = Math.floor(seconds  60)
    .toString()
    .padStart(2, "0");
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

 *
 * StudentHistoryModal — Modal chi tiết lịch sử làm bài của 1 học sinh.
 * Query bảng `attempts` theo student_id + session_id, sắp xếp created_at
 * TĂNG DẦN, hiển thị dạng timeline: Lần 1, Lần 2 (lần đạt)... kèm chi tiết
 * từ vựng trả lời sai của từng lần.
 */
export default function StudentHistoryModal({ student, sessionId, onClose }) {
  const [history, setHistory] = useState(null);
  const isOpen = !!student;

  useEffect(() => {
    if (!student) return;
    setHistory(null);
    fetchStudentHistory(student.id, sessionId).then(setHistory);
  }, [student, sessionId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? `Lịch sử làm bài — ${student.full_name}` : ""}
      maxWidth="max-w-2xl"
    >
      {history === null && <p className="text-sm text-slate-900 text-center py-6">Đang tải lịch sử...</p>}

      {history?.length === 0 && (
        <p className="text-sm text-slate-900 text-center py-6">Học sinh chưa làm bài buổi học này.</p>
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
               

              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <p className="font-bold text-slate-900 >
                  Lần {attempt.attempt_number ?? idx + 1}
                  {attempt.passed && <span className="text-success-text"> (Lần đạt)</span>}
                </p>
                <BadgeStatus status={attempt.passed ? "completed" : "failed"}  
              </div>

              <p className="text-sm text-slate-900 mb-2">
                Điểm số: <span className="font-bold text-slate-900 >{attempt.score}%</span> · Thời gian:{" "}
                <span className="font-bold text-slate-900 >{formatDuration(attempt.duration_seconds)}</span> ·{" "}
                {formatDateTime(attempt.created_at)}
              </p>

              {attempt.correct_count != null && attempt.total_questions != null && (
                <p className={`text-sm font-bold ${attempt.passed ? "text-success-text" : "text-danger-text"}`}>
                  {attempt.correct_count} attempt.total_questions} câu đúng
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}
