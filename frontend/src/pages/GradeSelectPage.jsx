import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearToken } from "../lib/auth";
import { CardContainer, Button } from "../components/ui";

export default function GradeSelectPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearToken();
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate">
              Xin chào, {user?.full_name || user?.name || "Học sinh"} 👋
            </h1>
            <p className="text-sm text-slate/70">Sẵn sàng cho buổi học hôm nay!</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        <div className="space-y-4">
          {/* Bài tập */}
          <CardContainer
            tone="tinted"
            hoverable
            onClick={() => navigate("/student/sessions")}
            className="flex items-center gap-4 py-6 cursor-pointer"
          >
            <span className="text-4xl" aria-hidden="true">📚</span>
            <div>
              <p className="font-bold text-lg text-slate">Bài tập</p>
              <p className="text-sm text-slate/70">Xem bài được giao và bắt đầu làm bài</p>
            </div>
          </CardContainer>

          {/* Bảng xếp hạng */}
          <CardContainer
            tone="white"
            hoverable
            onClick={() => navigate("/leaderboard")}
            className="flex items-center gap-4 py-6 cursor-pointer"
          >
            <span className="text-4xl" aria-hidden="true">🏆</span>
            <div>
              <p className="font-bold text-lg text-slate">Bảng xếp hạng</p>
              <p className="text-sm text-slate/70">Xem xếp hạng trong khối lớp của bạn</p>
            </div>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}
