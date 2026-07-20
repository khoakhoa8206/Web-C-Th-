import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { GraduationCap, Sparkles, Trophy, ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RoleSelectPage,
});

const roles = [
  {
    to: "/student/login" as const,
    tag: "Học sinh",
    title: "Bắt đầu học",
    description:
      "Luyện từ vựng với flashcard, trắc nghiệm, điền khuyết và ghép cặp — theo lộ trình của giáo viên.",
    icon: GraduationCap,
    accent: "from-pink-medium to-pink-dark",
  },
  {
    to: "/teacher" as const,
    tag: "Giáo viên",
    title: "Quản lý lớp học",
    description:
      "Tạo bài học bằng AI, quản lý học sinh, theo dõi tiến độ và điểm số theo thời gian thực.",
    icon: Sparkles,
    accent: "from-pink-dark to-pink-medium",
  },
];

function RoleSelectPage() {
  return (
    <div className="bg-app-gradient relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink-soft/60 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-pink-medium/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-warning-bg/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-medium text-white shadow-button">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-pink-dark">VocabHub</span>
          </div>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-pink-dark shadow-card backdrop-blur transition hover:bg-white hover:shadow-card-hover"
          >
            <Trophy className="h-4 w-4" />
            Bảng xếp hạng
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-soft bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-pink-dark backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Học từ vựng thông minh với AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-3xl text-5xl font-extrabold leading-tight text-ink sm:text-6xl"
          >
            Mỗi từ mới, một{" "}
            <span className="bg-linear-to-r from-pink-medium to-pink-dark bg-clip-text text-transparent">
              bước tiến
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Nền tảng luyện từ vựng tiếng Anh cho học sinh và giáo viên — flashcard,
            trắc nghiệm, ghép cặp, điền khuyết. Mượt mà. Đẹp. Hiệu quả.
          </motion.p>

          <div className="mt-14 grid w-full max-w-4xl gap-6 sm:grid-cols-2">
            {roles.map((role, i) => (
              <motion.div
                key={role.to}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={role.to} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-7 text-left shadow-card backdrop-blur-xl transition group-hover:shadow-card-hover"
                  >
                    <div
                      className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-linear-to-br ${role.accent} opacity-20 blur-2xl transition group-hover:opacity-40`}
                    />
                    <div className="relative flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <div
                          className={`grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br ${role.accent} text-white shadow-button`}
                        >
                          <role.icon className="h-7 w-7" />
                        </div>
                        <span className="rounded-full bg-pink-light px-3 py-1 text-xs font-semibold text-pink-dark">
                          {role.tag}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-ink">{role.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-pink-dark">
                        Vào ngay
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 rounded-2xl border border-white/60 bg-white/60 p-6 backdrop-blur"
          >
            {[
              { k: "4", v: "kiểu bài tập" },
              { k: "AI", v: "tạo bài tự động" },
              { k: "∞", v: "từ vựng luyện tập" },
            ].map((s) => (
              <div key={s.v} className="text-center">
                <div className="font-display text-3xl font-bold text-pink-dark">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </main>

        <footer className="pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VocabHub · Học từ vựng mỗi ngày
        </footer>
      </div>
    </div>
  );
}