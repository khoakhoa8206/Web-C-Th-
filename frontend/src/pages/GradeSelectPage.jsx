import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearToken } from "../lib/auth";
import { CardContainer, Button } from "../components/ui";

 *
 * Trang chào mừng học sinh — hiển thị tên và lớp từ JWT,
 * cung cấp nút đi thẳng đến danh sách buổi học.
 * (class_id trong JWT giờ là UUID nên không còn match với GRADES cố định)
 */
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
            <h1 className="text-xl font-bold text-slate-900 >
              Xin chào, {user?.full_name || user?.name || "Học sinh"} 👋
            </h1>
            <p className="text-sm text-slate-900">Sẵn sàng cho buổi học hôm nay!</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        <CardContainer
          tone="tinted"
          hoverable
          onClick={() => navigate("/student/sessions")}
          className="flex flex-col items-center justify-center text-center gap-3 py-10 cursor-pointer"
        >
          <span className="text-5xl" aria-hidden="true">📚</span>
          <span className="font-bold text-lg text-slate-900 >Vào danh sách buổi học</span>
          <span className="text-sm text-slate-900">
            Xem các buổi học được giao và bắt đầu làm bài
          </span>
        </CardContainer>
      </div>
    </div>
  );
}
