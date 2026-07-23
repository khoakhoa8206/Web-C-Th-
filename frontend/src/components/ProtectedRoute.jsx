import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

/** Chặn truy cập các trang cần đăng nhập — chưa có token hợp lệ sẽ về /login. */
export default function ProtectedRoute({ children }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/student/login" replace />;
  }
  return children;
}
