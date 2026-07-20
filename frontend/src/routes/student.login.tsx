import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, CardContainer, InputField } from "@/components/vocab-ui";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/student/login")({
  head: () => ({
    meta: [
      { title: "Đăng nhập học sinh — VocabHub" },
      {
        name: "description",
        content: "Đăng nhập để bắt đầu luyện từ vựng theo lộ trình của giáo viên.",
      },
    ],
  }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const navigate = useNavigate();
  const { user, isHydrated, login, isLoggingIn, error } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    if (isHydrated && user) navigate({ to: "/student" });
  }, [isHydrated, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await login(name.trim());
    if (ok) navigate({ to: "/student" });
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <CardContainer className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🌸</p>
          <h1 className="text-xl font-bold text-slate">Chào mừng học sinh</h1>
          <p className="text-sm text-slate/50 mt-1">Nhập họ tên để bắt đầu học</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <InputField
            label="Họ và tên"
            placeholder="VD: Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
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