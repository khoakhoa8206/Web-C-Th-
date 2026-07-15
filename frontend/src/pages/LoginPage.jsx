import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, InputField, CardContainer } from "../components/ui";
import { getCurrentUser } from "../lib/auth";

export default function LoginPage() {
  const [fullName, setFullName] = useState("");
  const [touched, setTouched] = useState(false);
  const { login, isLoggingIn, error } = useAuth();
  const navigate = useNavigate();

  // Đã đăng nhập rồi thì không cần xem lại trang login
  if (getCurrentUser()) {
    return <Navigate to="/student" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!fullName.trim()) return;
    const success = await login(fullName);
    if (success) navigate("/student");
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <CardContainer className="w-full max-w-sm" tone="white">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl mb-3">
            📖
          </div>
          <h1 className="text-xl font-bold text-pink-600">Học Từ Vựng Tiếng Anh</h1>
          <p className="text-sm text-slate/60 mt-1">Nhập tên để bắt đầu buổi học</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Họ và Tên"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={touched && !fullName.trim() ? "Vui lòng nhập họ và tên." : error}
            autoFocus
          />
          <Button type="submit" variant="primary" fullWidth isLoading={isLoggingIn}>
            Đăng nhập
          </Button>
        </form>
      </CardContainer>
    </div>
  );
}
