import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeStatus, CardContainer } from "@/components/vocab-ui";
import { ClassPicker } from "./class-picker";
import {
  fetchAttemptsForSession,
  fetchClasses,
  fetchSessionsForClass,
  fetchStudents,
  type AttemptRow,
} from "@/lib/teacher-api";

export function DashboardPanel() {
  const [classId, setClassId] = useState("");
  const [sessionId, setSessionId] = useState("");

  const classesQ = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  useEffect(() => {
    if (!classId && classesQ.data?.[0]) setClassId(classesQ.data[0].id);
  }, [classesQ.data, classId]);

  const sessionsQ = useQuery({
    queryKey: ["sessions", classId],
    queryFn: () => fetchSessionsForClass(classId),
    enabled: !!classId,
  });
  useEffect(() => {
    setSessionId(sessionsQ.data?.[0]?.id ?? "");
  }, [sessionsQ.data]);

  const studentsQ = useQuery({
    queryKey: ["students", classId],
    queryFn: () => fetchStudents(classId),
    enabled: !!classId,
  });

  const attemptsQ = useQuery({
    queryKey: ["attempts", sessionId],
    queryFn: () => fetchAttemptsForSession(sessionId),
    enabled: !!sessionId,
    refetchInterval: 5000,
  });

  const latestByStudent = useMemo(() => {
    const map: Record<string, AttemptRow> = {};
    for (const a of attemptsQ.data || []) {
      const prev = map[a.student_id];
      if (!prev || new Date(a.created_at) > new Date(prev.created_at)) {
        map[a.student_id] = a;
      }
    }
    return map;
  }, [attemptsQ.data]);

  const students = studentsQ.data || [];

  return (
    <div>
      <h2 className="font-bold text-slate text-lg">
        Theo dõi tiến độ theo thời gian thực
      </h2>
      <p className="text-sm text-slate/50 mb-4">
        Bảng tự làm mới mỗi 5 giây khi có bài nộp mới.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <ClassPicker
          classes={classesQ.data || []}
          value={classId}
          onChange={setClassId}
        />
        <div>
          <label className="block text-xs font-semibold text-slate/50 mb-1">
            Bài tập
          </label>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          >
            {(sessionsQ.data || []).length === 0 && (
              <option value="">Chưa có bài tập</option>
            )}
            {(sessionsQ.data || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {students.length === 0 ? (
        <CardContainer className="text-center py-10">
          <p className="text-sm text-slate/40">
            {studentsQ.isLoading
              ? "Đang tải..."
              : "Lớp này chưa có học sinh."}
          </p>
        </CardContainer>
      ) : (
        <CardContainer padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-soft text-left text-xs font-bold text-slate/50 uppercase tracking-wide">
                  <th className="px-4 py-3">Học sinh</th>
                  <th className="px-4 py-3 text-center">Điểm</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Lúc</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const a = latestByStudent[s.id];
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-surface-border last:border-0 hover:bg-pink-50/40"
                    >
                      <td className="px-4 py-3 font-semibold text-slate">
                        {s.full_name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold tabular-nums">
                        {a ? `${a.score}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a ? (
                          <BadgeStatus
                            status={a.passed ? "completed" : "failed"}
                          />
                        ) : (
                          <BadgeStatus status="in-progress" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate/50">
                        {a
                          ? new Date(a.created_at).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })
                          : "Chưa làm"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContainer>
      )}
    </div>
  );
}