import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchGradeSessions } from "../lib/studentPracticeApi";
import { CardContainer, Button } from "../components/ui";

/**
 * SessionListPage — danh sách buổi học PUBLISHED của lớp học sinh.
 * Không cần gradeId từ URL nữa vì server tự lọc theo class_id trong JWT.
 */
export default function SessionListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchGradeSessions().then((data) => {
      if (!cancelled) setSessions(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/student" className="text-pink-600 font-semibold text-sm">
            ← Quay lại
          </Link>
          <h1 className="text-xl font-bold text-slate">
            Danh sách buổi học
          </h1>
        </div>

        <div className="space-y-3">
          {sessions === null && (
            <p className="text-sm text-slate/50">Đang tải danh sách buổi học...</p>
          )}
          {sessions?.length === 0 && (
            <p className="text-sm text-slate/50">Chưa có buổi học nào được giao.</p>
          )}
          {sessions?.map((s) => (
            <CardContainer key={s.sessionId} hoverable className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate">{s.title}</p>
                {s.publishedAt && (
                  <p className="text-xs text-slate/50">
                    Giao ngày {new Date(s.publishedAt).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/student/practice/${s.sessionId}`)}
              >
                Vào học
              </Button>
            </CardContainer>
          ))}
        </div>
      </div>
    </div>
  );
}
