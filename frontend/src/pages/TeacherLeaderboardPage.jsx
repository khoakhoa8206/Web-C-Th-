import React, { useEffect, useState } from "react";
import { fetchClasses } from "../lib/sessionsApi";
import { fetchLeaderboardSessions, fetchLeaderboard } from "../lib/leaderboardApi";
import { CardContainer } from "../components/ui";

function formatDuration(sec) {
  if (sec == null) return "—";
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * TeacherLeaderboardPage — bảng xếp hạng cho giáo viên.
 * Giáo viên có thể xem tất cả lớp, tất cả buổi học, không bị giới hạn class_id.
 */
export default function TeacherLeaderboardPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [leaderboard, setLeaderboard] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [error, setError] = useState("");

  // Tải danh sách lớp
  useEffect(() => {
    fetchClasses()
      .then(setClasses)
      .catch(() => setError("Không thể tải danh sách lớp."));
  }, []);

  // Khi đổi lớp → tải sessions tương ứng
  useEffect(() => {
    setSessions([]);
    setSelectedSessionId("");
    setLeaderboard(null);
    if (!selectedClassId) return;
    setIsLoadingSessions(true);
    fetchLeaderboardSessions(selectedClassId)
      .then(setSessions)
      .catch(() => setError("Không thể tải danh sách buổi học."))
      .finally(() => setIsLoadingSessions(false));
  }, [selectedClassId]);

  // Khi đổi session → tải bảng xếp hạng
  useEffect(() => {
    setLeaderboard(null);
    if (!selectedSessionId) return;
    setIsLoadingBoard(true);
    setError("");
    fetchLeaderboard(selectedSessionId)
      .then(setLeaderboard)
      .catch(() => setError("Không thể tải bảng xếp hạng."))
      .finally(() => setIsLoadingBoard(false));
  }, [selectedSessionId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate">🏆 Bảng xếp hạng</h2>
        <p className="text-sm text-slate/60 mt-0.5">Xem kết quả của toàn bộ học sinh theo từng buổi học.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Bộ lọc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate/70 block mb-1">Chọn lớp</label>
          <select
            className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-sm text-slate outline-none focus:border-pink-400"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">— Tất cả lớp —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate/70 block mb-1">Chọn buổi học</label>
          <select
            className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-sm text-slate outline-none focus:border-pink-400 disabled:opacity-50"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            disabled={!selectedClassId || isLoadingSessions}
          >
            <option value="">
              {isLoadingSessions ? "Đang tải…" : "— Chọn buổi học —"}
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trạng thái rỗng */}
      {!selectedClassId && (
        <p className="text-sm text-slate/50 text-center py-10">Chọn lớp để xem danh sách buổi học.</p>
      )}
      {selectedClassId && !selectedSessionId && !isLoadingSessions && sessions.length === 0 && (
        <p className="text-sm text-slate/50 text-center py-10">Lớp này chưa có buổi học nào được xuất bản.</p>
      )}
      {selectedClassId && !selectedSessionId && sessions.length > 0 && (
        <p className="text-sm text-slate/50 text-center py-10">Chọn buổi học để xem bảng xếp hạng.</p>
      )}

      {isLoadingBoard && (
        <p className="text-sm text-slate/70 text-center py-10">Đang tải bảng xếp hạng…</p>
      )}

      {/* Bảng xếp hạng */}
      {leaderboard && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate">{leaderboard.session_title}</p>
              <p className="text-xs text-slate/60">
                {selectedClass?.name || leaderboard.class_name} — {leaderboard.ranked.length} học sinh hoàn thành
              </p>
            </div>
          </div>

          {leaderboard.ranked.length === 0 ? (
            <p className="text-sm text-slate/50 text-center py-10">
              Chưa có học sinh nào hoàn thành buổi học này.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.ranked.map((entry) => (
                <CardContainer
                  key={entry.student_id}
                  className="flex items-center gap-4"
                >
                  <span className="text-xl w-8 text-center shrink-0 font-bold">
                    {entry.rank <= 3 ? MEDALS[entry.rank - 1] : <span className="text-slate/50 text-base">#{entry.rank}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate truncate">{entry.full_name}</p>
                    <p className="text-xs text-slate/60">{entry.total_attempts} lần làm bài</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-pink-600 text-lg">{entry.best_score}%</p>
                    <p className="text-xs text-slate/60">{formatDuration(entry.best_duration)}</p>
                  </div>
                </CardContainer>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
