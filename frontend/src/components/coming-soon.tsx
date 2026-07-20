import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles } from "lucide-react";

interface ComingSoonProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ComingSoon({ eyebrow, title, description }: ComingSoonProps) {
  return (
    <div className="bg-app-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-pink-soft/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-medium/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-card backdrop-blur-xl"
      >
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-pink-light px-3 py-1 text-xs font-semibold text-pink-dark">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
        <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-medium px-5 py-2.5 text-sm font-semibold text-white shadow-button transition hover:bg-pink-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>
      </motion.div>
    </div>
  );
}