import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { fetchLeaderboardSessions, fetchLeaderboard } from "../lib/leaderboardApi";
import { getCurrentUser } from "../lib/auth";
import { CardContainer } from "../components/ui";

function formatDuration(sec) {
  if (sec == null) return "—";
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * LeaderboardPage v2 — chỉ xem xếp hạng trong khối lớp của mình.
 * Cần đăng nhập. Tự lấy class_id từ JWT.
 */
export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [className, setClassName] = useState("");

  const selectedSessionId = searchParams.get("session_id") || "";

  // Nếu chưa đăng nhập, redirect về login
  useEffect(() => {
    if (!user) {
      navigate("/student/login", { replace: true });
    }
  }, [user, navigate]);

  // Lấy danh sách session của lớp mình (class_id lấy từ JWT)
  useEffect(() => {
    if (!user) return;
    const classId = user.class_id;
    if (!classId) return;

    fetchLeaderboardSessions(classId)
      .then((data) => {
        setSessions(data);
        // Lấy tên lớp từ session đầu tiên nếu có
        if (data.length > 0 && data[0].class_name) {
          setClassName(data[0].class_name);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setLeaderboard(null);
    if (!selectedSessionId) return;
    setIsLoading(true);
    fetchLeaderboard(selectedSessionId)
      .then(setLeaderboard)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedSessionId]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/student" className="text-pink-600 font-semibold text-sm">← Quay lại</Link>
          <div>
            <h1 className="text-xl font-bold text-slate">🏆 Bảng xếp hạng</h1>
            {className && (
              <p className="text-sm text-slate/70">{className}</p>
            )}
          </div>
        </div>

        {/* Chọn buổi học */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate/70 block mb-1">Chọn buổi học</label>
          <select
            className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-sm text-slate outline-none focus:border-pink-400"
            value={selectedSessionId}
            onChange={(e) => setSearchParams({ session_id: e.target.value })}
          >
            <option value="">— Chọn buổi học —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {sessions.length === 0 && (
          <p className="text-sm text-slate/70 text-center py-8">Lớp bạn chưa có buổi học nào.</p>
        )}

        {isLoading && <p className="text-sm text-slate/70 text-center py-8">Đang tải…</p>}

        {leaderboard && (
          <>
            <p className="text-sm font-semibold text-slate text-center mb-4">
              {leaderboard.session_title}
            </p>
            {leaderboard.ranked.length === 0 && (
              <p className="text-sm text-slate/70 text-center py-8">
                Chưa có học sinh nào hoàn thành buổi học này.
              </p>
            )}
            <div className="space-y-2">
              {leaderboard.ranked.map((entry) => {
                const isMe = entry.full_name === user?.full_name;
                return (
                  <CardContainer
                    key={entry.student_id}
                    className={["flex items-center gap-4", isMe ? "ring-2 ring-pink-400 bg-pink-50" : ""].join(" ")}
                  >
                    <span className="text-xl w-8 text-center shrink-0">
                      {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate truncate">
                        {entry.full_name}
                        {isMe && <span className="ml-2 text-xs text-pink-600 font-semibold">(bạn)</span>}
                      </p>
                      <p className="text-xs text-slate/70">{entry.total_attempts} lần làm</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-pink-600">{entry.best_score}%</p>
                      <p className="text-xs text-slate/70">{formatDuration(entry.best_duration)}</p>
                    </div>
                  </CardContainer>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
