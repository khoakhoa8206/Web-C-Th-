import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button, CardContainer, InputField } from "@/components/vocab-ui";
import { teacherLogin } from "@/lib/teacher-auth";

export function TeacherLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await teacherLogin(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-6">
      <CardContainer className="w-full max-w-sm">
        <Link to="/" className="text-xs text-slate/40 hover:text-pink-600">
          ← Trang chủ
        </Link>
        <h1 className="font-extrabold text-slate text-xl mt-4">
          Đăng nhập giáo viên
        </h1>
        <p className="text-sm text-slate/50 mt-1 mb-6">
          Nhập mật khẩu được cấu hình trên server.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoFocus
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
          >
            Đăng nhập
          </Button>
        </form>
      </CardContainer>
    </div>
  );
}