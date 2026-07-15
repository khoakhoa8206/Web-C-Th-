import { useCallback, useState } from "react";
import { getCurrentUser, saveToken, clearToken } from "../lib/auth";
import { loginWithName } from "../lib/studentPracticeApi";

/**
 * useAuth — quản lý trạng thái đăng nhập dựa trên JWT lưu trong LocalStorage.
 * Không dùng React Query ở đây vì đây là state cục bộ của trình duyệt,
 * không phải dữ liệu cần cache/đồng bộ với server theo kiểu query.
 */
export function useAuth() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (fullName) => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const { token } = await loginWithName(fullName);
      saveToken(token);
      setUser(getCurrentUser());
      return true;
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return { user, isLoggingIn, error, login, logout };
}
