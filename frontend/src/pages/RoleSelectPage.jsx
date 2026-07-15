import React from "react";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "../components/ui";

/**
 * RoleSelectPage — màn hình chọn vai trò khi mở app.
 * Học sinh -> /student (yêu cầu đăng nhập bằng tên riêng)
 * Giáo viên -> /teacher (Master Dashboard, chưa yêu cầu đăng nhập riêng)
 */
export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <p className="text-4xl mb-2">📖</p>
        <h1 className="text-xl font-bold text-slate mb-1">Học Từ Vựng Tiếng Anh</h1>
        <p className="text-sm text-slate/50 mb-8">Bạn đang truy cập với vai trò nào?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardContainer hoverable onClick={() => navigate("/student")} className="py-8">
            <p className="text-3xl mb-2">🧑‍🎓</p>
            <p className="font-bold text-slate">Học sinh</p>
            <p className="text-xs text-slate/40 mt-1">Vào học từ vựng</p>
          </CardContainer>

          <CardContainer hoverable onClick={() => navigate("/teacher")} className="py-8" tone="tinted">
            <p className="text-3xl mb-2">🧑‍🏫</p>
            <p className="font-bold text-slate">Giáo viên</p>
            <p className="text-xs text-slate/40 mt-1">Dashboard quản lý lớp học</p>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}
