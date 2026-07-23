import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchGradeSessions } from "../lib/studentPracticeApi";
import { CardContainer, Button } from "../components/ui";
import MyHistoryModal from "../components/practice/MyHistoryModal";

/**
 * SessionListPage — danh sách buổi học PUBLISHED của mọi lớp.
 * Mục 9: Học sinh thấy bài tập của lớp khác nhưng không mở được.
 * Mục 7: Nút Vào làm / Xem lại theo deadline. Nút 🕘 xem lịch sử.
 * Mục 4: Badge đỏ nếu quá hạn + chưa đạt (chưa có thông tin attempt ở đây — để giai đoạn sau).
 */
export default function SessionListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);
  const [historyModal, setHistoryModal] = useState(null); // { sessionId, sessionTitle }

  useEffect(() => {
    let cancelled = false;
    fetchGradeSessions().then((data) => {
      if (!cancelled) setSessions(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Nhóm sessions: lớp mình trước, lớp khác sau
  const ownSessions = sessions?.filter((s) => s.isOwnClass) ?? [];
  const otherSessions = sessions?.filter((s) => !s.isOwnClass) ?? [];

  const isPastDeadline = (s) => s.deadline && new Date(s.deadline) < new Date();

  const renderCard = (s) => {
    const locked = !s.isOwnClass;
    const past = isPastDeadline(s);

    return (
      <CardContainer
        key={s.sessionId}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate truncate">{s.title}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {s.className && (
              <span className="text-xs bg-surface-soft text-slate-900 px-2 py-0.5 rounded-full">
                {s.className}
              </span>
            )}
            {s.publishedAt && (
              <span className="text-xs text-slate-900">
                · Giao {new Date(s.publishedAt).toLocaleDateString("vi-VN")}
              </span>
            )}
            {s.deadline && (
              <span className={`text-xs font-semibold ${past ? "text-danger-text" : "text-warning-text"}`}>
                · Hạn: {new Date(s.deadline).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Link xếp hạng — hiện cho tất cả (lớp mình lẫn lớp khác) */}
          <Link
            to={`/leaderboard?class_id=${s.classId}&session_id=${s.sessionId}`}
            className="text-xs text-slate-900 hover:text-pink-600"
          >
            🏆 Xếp hạng
          </Link>

          {/* Nút lịch sử và làm bài — CHỈ lớp mình */}
          {!locked && (
            <>
              <button
                className="text-slate-900 hover:text-pink-600 text-lg"
                title="Lịch sử làm bài"
                onClick={() => setHistoryModal({ sessionId: s.sessionId, sessionTitle: s.title })}
              >
                🕘
              </button>
              {past ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryModal({ sessionId: s.sessionId, sessionTitle: s.title })}
                >
                  Xem lại
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/student/practice/${s.sessionId}`)}
                >
                  Vào làm
                </Button>
              )}
            </>
          )}
          {/* Lớp khác: không có nút làm bài, chỉ có link xếp hạng ở trên */}
        </div>
      </CardContainer>
    );
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/student" className="text-pink-600 font-semibold text-sm">
            ← Quay lại
          </Link>
          <h1 className="text-xl font-bold text-slate">Danh sách buổi học</h1>
        </div>

        {sessions === null && (
          <p className="text-sm text-slate-900">Đang tải danh sách buổi học...</p>
        )}

        {sessions?.length === 0 && (
          <p className="text-sm text-slate-900">Chưa có buổi học nào được giao.</p>
        )}

        {/* Bài tập của lớp mình */}
        {ownSessions.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Lớp của bạn</p>
            {ownSessions.map(renderCard)}
          </div>
        )}

        {/* Bài tập của lớp khác */}
        {otherSessions.length > 0 && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Các lớp khác</p>
              <p className="text-xs text-slate-900">Chỉ xem, không thể làm bài</p>
            </div>
            {otherSessions.map(renderCard)}
          </div>
        )}
      </div>

      {/* Modal lịch sử */}
      <MyHistoryModal
        isOpen={!!historyModal}
        sessionId={historyModal?.sessionId}
        sessionTitle={historyModal?.sessionTitle}
        onClose={() => setHistoryModal(null)}
      />
    </div>
  );
}
