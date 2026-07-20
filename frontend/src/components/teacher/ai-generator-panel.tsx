import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, CardContainer } from "@/components/vocab-ui";
import { ClassPicker } from "./class-picker";
import {
  fetchClasses,
  generateLessonFromVocab,
  publishSession,
  updateExercises,
  type GeneratedLesson,
} from "@/lib/teacher-api";

type Phase = "input" | "loading" | "preview" | "done";
type Tab = "flashcards" | "match_up" | "fill_in_blanks" | "mcqs";

const TAB_LABELS: Record<Tab, string> = {
  flashcards: "Flashcards",
  match_up: "Nối từ",
  fill_in_blanks: "Điền từ",
  mcqs: "Trắc nghiệm",
};

export function AiGeneratorPanel() {
  const qc = useQueryClient();
  const [phase, setPhase] = useState<Phase>("input");
  const [classId, setClassId] = useState("");
  const [vocab, setVocab] = useState("");
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [tab, setTab] = useState<Tab>("flashcards");
  const [error, setError] = useState<string | null>(null);

  const classesQ = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  useEffect(() => {
    if (!classId && classesQ.data?.[0]) setClassId(classesQ.data[0].id);
  }, [classesQ.data, classId]);

  const generate = useMutation({
    mutationFn: () => generateLessonFromVocab(vocab, classId),
    onMutate: () => {
      setError(null);
      setPhase("loading");
    },
    onSuccess: (data) => {
      setLesson(data);
      setPhase("preview");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Không thể tạo bài.");
      setPhase("input");
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!lesson) throw new Error("Chưa có dữ liệu.");
      await updateExercises(
        lesson.session_id,
        lesson.exercises,
        lesson.session_title,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const publish = useMutation({
    mutationFn: async () => {
      if (!lesson) throw new Error("Chưa có dữ liệu.");
      await updateExercises(
        lesson.session_id,
        lesson.exercises,
        lesson.session_title,
      );
      await publishSession(lesson.session_id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setPhase("done");
    },
  });

  const restart = () => {
    setLesson(null);
    setVocab("");
    setPhase("input");
  };

  if (phase === "loading") {
    return (
      <CardContainer className="py-20 text-center">
        <div className="mx-auto h-14 w-14 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
        <h3 className="mt-6 font-bold text-slate">AI đang tạo bài tập…</h3>
        <p className="text-sm text-slate/50 mt-1">
          Có thể mất 20-40 giây tùy độ dài từ vựng.
        </p>
      </CardContainer>
    );
  }

  if (phase === "done") {
    return (
      <CardContainer className="py-16 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="font-extrabold text-slate text-lg">
          Đã xuất bản bài tập!
        </h3>
        <p className="text-sm text-slate/50 mt-1 mb-6">
          Học sinh trong lớp đã có thể luyện tập ngay.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={restart}>
            Tạo bài khác
          </Button>
        </div>
      </CardContainer>
    );
  }

  if (phase === "preview" && lesson) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-slate text-lg">
              Xem trước bài tập
            </h2>
            <p className="text-sm text-slate/50">
              Xem lại nội dung do AI tạo, sau đó lưu bản nháp hoặc xuất bản.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={restart}>
              Huỷ
            </Button>
            <Button
              variant="secondary"
              isLoading={save.isPending}
              onClick={() => save.mutate()}
            >
              Lưu nháp
            </Button>
            <Button
              variant="primary"
              isLoading={publish.isPending}
              onClick={() => publish.mutate()}
            >
              Xuất bản
            </Button>
          </div>
        </div>

        <CardContainer className="mb-4">
          <label className="text-xs font-semibold text-slate/50">
            Tiêu đề bài tập
          </label>
          <input
            value={lesson.session_title}
            onChange={(e) =>
              setLesson({ ...lesson, session_title: e.target.value })
            }
            className="mt-1 w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />
        </CardContainer>

        <div className="flex gap-1 mb-3 bg-pink-50 p-1 rounded-2xl overflow-x-auto">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-4 h-9 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors " +
                (tab === t
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-slate/60 hover:text-slate")
              }
            >
              {TAB_LABELS[t]} ({(lesson.exercises[t] || []).length})
            </button>
          ))}
        </div>

        <CardContainer padded={false}>
          <PreviewList lesson={lesson} tab={tab} />
        </CardContainer>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-slate text-lg">AI Generator</h2>
      <p className="text-sm text-slate/50 mb-4">
        Dán danh sách từ vựng (mỗi từ một dòng theo dạng{" "}
        <code className="text-pink-600">từ - nghĩa</code>). AI sẽ tự tạo đủ 4
        dạng bài.
      </p>

      <CardContainer className="space-y-4">
        <div className="max-w-xs">
          <ClassPicker
            classes={classesQ.data || []}
            value={classId}
            onChange={setClassId}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate mb-1.5">
            Danh sách từ vựng
          </label>
          <textarea
            value={vocab}
            onChange={(e) => setVocab(e.target.value)}
            rows={10}
            placeholder={"apple - quả táo\nrun - chạy\nbeautiful - đẹp"}
            className="w-full rounded-2xl border border-surface-border bg-white px-4 py-3 text-sm text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 font-mono"
          />
        </div>

        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            variant="primary"
            disabled={!vocab.trim() || !classId}
            onClick={() => generate.mutate()}
          >
            ✨ Tạo bài với AI
          </Button>
        </div>
      </CardContainer>
    </div>
  );
}

function PreviewList({
  lesson,
  tab,
}: {
  lesson: GeneratedLesson;
  tab: Tab;
}) {
  const items = lesson.exercises[tab] || [];
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate/40 text-center py-8">
        AI không tạo được mục nào cho dạng bài này.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-surface-border">
      {items.map((it, i) => (
        <li key={"id" in it ? it.id : i} className="px-5 py-3 text-sm">
          {tab === "flashcards" && (
            <div>
              <span className="font-bold text-slate">
                {(it as { word: string }).word}
              </span>{" "}
              <span className="text-slate/60">
                — {(it as { meaning: string }).meaning}
              </span>
              {(it as { example?: string }).example && (
                <p className="text-xs text-slate/50 mt-0.5 italic">
                  {(it as { example?: string }).example}
                </p>
              )}
            </div>
          )}
          {tab === "match_up" && (
            <div>
              <span className="font-bold text-slate">
                {(it as { term: string }).term}
              </span>{" "}
              ↔{" "}
              <span className="text-slate/70">
                {(it as { definition: string }).definition}
              </span>
            </div>
          )}
          {tab === "fill_in_blanks" && (
            <div>
              <p className="text-slate">
                {(it as { sentence: string }).sentence}
              </p>
              <p className="text-xs text-pink-600 font-semibold mt-0.5">
                → {(it as { correct_answer: string }).correct_answer}
              </p>
            </div>
          )}
          {tab === "mcqs" && (
            <div>
              <p className="font-semibold text-slate">
                {(it as { question: string }).question}
              </p>
              <ul className="mt-1 space-y-0.5 text-xs">
                {(it as { options: string[] }).options.map((o, oi) => {
                  const isCorrect =
                    o === (it as { correct_answer: string }).correct_answer;
                  return (
                    <li
                      key={oi}
                      className={
                        isCorrect
                          ? "text-success-text font-semibold"
                          : "text-slate/60"
                      }
                    >
                      {String.fromCharCode(65 + oi)}. {o}
                      {isCorrect && " ✓"}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}