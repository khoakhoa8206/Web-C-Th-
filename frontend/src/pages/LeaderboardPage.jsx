import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchLeaderboardClasses, fetchLeaderboardSessions, fetchLeaderboard } from "../lib/leaderboardApi";
import { CardContainer } from "../components/ui";

function formatDuration(sec) {
  if (sec == null) return "—";
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * LeaderboardPage — bảng xếp hạng chia theo khối lớp.
 * Public: ai cũng xem được, không cần đăng nhập.
 * Chọn khối lớp → chọn buổi học của khối đó → xem bảng xếp hạng.
 */
export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedClassId = searchParams.get("class_id") || "";
  const selectedSessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    fetchLeaderboardClasses().then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    setSessions([]);
    setLeaderboard(null);
    if (!selectedClassId) return;
    fetchLeaderboardSessions(selectedClassId).then(setSessions).catch(() => {});
  }, [selectedClassId]);

  useEffect(() => {
    setLeaderboard(null);
    if (!selectedSessionId) return;
    setIsLoading(true);
    fetchLeaderboard(selectedSessionId)
      .then(setLeaderboard)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedSessionId]);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-pink-600 font-semibold text-sm">← Trang chủ</Link>
          <h1 className="text-xl font-bold text-slate">🏆 Bảng xếp hạng</h1>
        </div>

        {/* Chọn khối lớp + buổi học */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-slate/70 block mb-1">Khối lớp</label>
            <select
              className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-sm text-slate outline-none focus:border-pink-400"
              value={selectedClassId}
              onChange={(e) => setSearchParams({ class_id: e.target.value })}
            >
              <option value="">— Chọn khối —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate/70 block mb-1">Buổi học</label>
            <select
              className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-sm text-slate outline-none focus:border-pink-400"
              value={selectedSessionId}
              onChange={(e) => setSearchParams({ class_id: selectedClassId, session_id: e.target.value })}
              disabled={!selectedClassId}
            >
              <option value="">— Chọn buổi học —</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng xếp hạng */}
        {isLoading && <p className="text-sm text-slate/70 text-center py-8">Đang tải…</p>}

        {leaderboard && (
          <>
            <p className="text-xs text-slate/70 text-center mb-4">
              {leaderboard.class_name} · {leaderboard.session_title}
            </p>
            {leaderboard.ranked.length === 0 && (
              <p className="text-sm text-slate/70 text-center py-8">
                Chưa có học sinh nào hoàn thành buổi học này.
              </p>
            )}
            <div className="space-y-2">
              {leaderboard.ranked.map((entry) => (
                <CardContainer key={entry.student_id} className="flex items-center gap-4">
                  <span className="text-xl w-8 text-center shrink-0">
                    {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate truncate">{entry.full_name}</p>
                    <p className="text-xs text-slate/70">{entry.total_attempts} lần làm</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-pink-600">{entry.best_score}%</p>
                    <p className="text-xs text-slate/70">{formatDuration(entry.best_duration)}</p>
                  </div>
                </CardContainer>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
