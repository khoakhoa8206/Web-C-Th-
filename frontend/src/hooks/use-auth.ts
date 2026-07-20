import { useCallback, useEffect, useState } from "react";
import { clearToken, getCurrentUser, saveToken } from "@/lib/auth";
import { loginWithName } from "@/lib/student-api";
import type { JwtPayload } from "@/lib/jwt";

export function useAuth() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isHydrated, setHydrated] = useState(false);
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    setHydrated(true);
  }, []);

  const login = useCallback(async (fullName: string) => {
    setLoggingIn(true);
    setError(null);
    try {
      const { token } = await loginWithName(fullName);
      saveToken(token);
      setUser(getCurrentUser());
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setError(msg);
      return false;
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return { user, isHydrated, isLoggingIn, error, login, logout };
}