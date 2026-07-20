import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ProgressBar } from "@/components/vocab-ui";
import { FlashcardComponent, type FlashVocab } from "./flashcard-component";
import { MatchUpComponent } from "./match-up-component";
import { FillInBlanksComponent } from "./fill-in-blanks-component";
import { MCQComponent } from "./mcq-component";
import { ResultScreen, type PracticeResult } from "./result-screen";
import { VocabReviewStep } from "./vocab-review-step";
import {
  startAttempt,
  updateAttemptStep,
  submitAttempt,
  type ExercisesPayload,
} from "@/lib/student-api";
import { shuffleMcqQuestions, type McqQuestion } from "@/lib/shuffle";

const TOTAL_STEPS = 4;
const STEP_LABELS = ["Flashcard", "Nối từ", "Điền từ", "Trắc nghiệm"];

type Phase = "ready" | "playing" | "result";
interface Answers {
  flashcard: { flippedIds: string[] };
  matchup: { matchedPairs: Record<string, string> };
  fillblanks: { values: Record<string, string> };
  mcq: { shuffledQuestions: McqQuestion[] | null; selections: Record<string, number> };
}

const initialAnswers = (): Answers => ({
  flashcard: { flippedIds: [] },
  matchup: { matchedPairs: {} },
  fillblanks: { values: {} },
  mcq: { shuffledQuestions: null, selections: {} },
});

const draftKey = (sessionId: string) => `draft_session_${sessionId}`;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function PracticeFlow({
  sessionId,
  exercises,
}: {
  sessionId: string;
  exercises: ExercisesPayload;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [step, setStep] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers());
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [pendingSyncNotice, setPendingSyncNotice] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load draft on mount only (client)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey(sessionId));
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.phase) setPhase(d.phase);
      if (d.step) setStep(d.step);
      if (d.timerSeconds) setTimerSeconds(d.timerSeconds);
      if (d.answers) setAnswers(d.answers);
      if (d.result) setResult(d.result);
      if (d.attemptId) setAttemptId(d.attemptId);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const flashcardVocab: FlashVocab[] = useMemo(
    () =>
      (exercises.flashcards || []).map((f) => ({
        id: f.id,
        word: f.word,
        meaning: f.meaning,
        phonetic: f.example ? `Ví dụ: ${f.example}` : "",
      })),
    [exercises.flashcards],
  );
  const matchUpVocab = useMemo(
    () =>
      (exercises.match_up || []).map((m) => ({
        id: m.id,
        word: m.term,
        meaning: m.definition,
      })),
    [exercises.match_up],
  );
  const fillInItems = exercises.fill_in_blanks || [];
  const mcqQuestions = useMemo<McqQuestion[]>(
    () =>
      (exercises.mcqs || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options.map((text) => ({ text })),
        correctIndex: q.options.indexOf(q.correct_answer),
      })),
    [exercises.mcqs],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    intervalRef.current = setInterval(() => setTimerSeconds((p) => p + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        draftKey(sessionId),
        JSON.stringify({ phase, step, timerSeconds, answers, result, attemptId }),
      );
    } catch {
      /* ignore */
    }
  }, [sessionId, phase, step, timerSeconds, answers, result, attemptId]);

  const handleReady = useCallback(async () => {
    setStepError(null);
    try {
      const data = await startAttempt(sessionId);
      setAttemptId(data.attempt_id);
      setPhase("playing");
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "Không thể bắt đầu làm bài.");
    }
  }, [sessionId]);

  const goToStep = useCallback(
    async (nextStep: number) => {
      setStepError(null);
      if (attemptId) {
        try {
          await updateAttemptStep(attemptId, nextStep);
        } catch (err) {
          setStepError(err instanceof Error ? err.message : "Không thể chuyển bước.");
          return;
        }
      }
      setStep(nextStep);
    },
    [attemptId],
  );

  useEffect(() => {
    if (
      step === 4 &&
      phase === "playing" &&
      !answers.mcq.shuffledQuestions &&
      mcqQuestions.length > 0
    ) {
      setAnswers((prev) => ({
        ...prev,
        mcq: { ...prev.mcq, shuffledQuestions: shuffleMcqQuestions(mcqQuestions) },
      }));
    }
  }, [step, phase, mcqQuestions, answers.mcq.shuffledQuestions]);

  const handleReshuffleMcq = useCallback(() => {
    setAnswers((prev) => ({
      ...prev,
      mcq: {
        shuffledQuestions: shuffleMcqQuestions(prev.mcq.shuffledQuestions || mcqQuestions),
        selections: {},
      },
    }));
  }, [mcqQuestions]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    setStepError(null);
    const matchUpAnswers = Object.entries(answers.matchup.matchedPairs).map(
      ([id, matched_id]) => ({ id, matched_id }),
    );
    const fillAnswers = Object.entries(answers.fillblanks.values).map(([id, val]) => ({
      id,
      student_answer: val,
    }));
    const { shuffledQuestions, selections } = answers.mcq;
    const mcqAnswers = Object.entries(selections).map(([qid, optIdx]) => {
      const q = (shuffledQuestions || []).find((x) => x.id === qid);
      return { id: qid, student_answer: q?.options?.[optIdx]?.text || "" };
    });
    try {
      const r = await submitAttempt(
        attemptId,
        { match_up: matchUpAnswers, fill_in_blanks: fillAnswers, mcqs: mcqAnswers },
        timerSeconds,
      );
      setResult({
        score: r.accuracy,
        passed: r.status === "PASSED",
        correctCount: r.correct_count,
        total: r.total_questions,
        gradedAnswers: (r.results || []).map((x, idx) => ({
          questionId: x.id || `r${idx}`,
          isCorrect: x.is_correct,
          selectedAnswer: x.student_answer,
          correctAnswer: x.correct_answer || x.correct_answer_id,
          type: x.type,
          question: x.question || x.sentence || x.term,
        })),
        pending: false,
      });
      setPendingSyncNotice(false);
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "Lỗi khi nộp bài.");
      const graded = (shuffledQuestions || []).map((q) => ({
        questionId: q.id,
        selectedIndex: selections[q.id] ?? -1,
        correctIndex: q.correctIndex,
        isCorrect: selections[q.id] === q.correctIndex,
      }));
      const localCorrect = graded.filter((a) => a.isCorrect).length;
      const localScore = graded.length
        ? Math.round((localCorrect / graded.length) * 100)
        : 0;
      setResult({
        score: localScore,
        passed: localScore >= 80,
        correctCount: localCorrect,
        total: graded.length,
        gradedAnswers: graded,
        pending: true,
      });
      setPendingSyncNotice(true);
    } finally {
      setIsSubmitting(false);
      setPhase("result");
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [answers, attemptId, timerSeconds]);

  const handleRetry = useCallback(() => {
    setAnswers(initialAnswers());
    setResult(null);
    setAttemptId(null);
    setTimerSeconds(0);
    setStep(1);
    setPhase("ready");
  }, []);

  const handleExit = useCallback(() => {
    try {
      window.localStorage.removeItem(draftKey(sessionId));
    } catch {
      /* ignore */
    }
  }, [sessionId]);

  if (phase === "ready") {
    return (
      <VocabReviewStep
        vocabList={flashcardVocab}
        onReady={handleReady}
        stepError={stepError}
      />
    );
  }

  if (phase === "result" && result) {
    return (
      <ResultScreen
        result={result}
        pendingSyncNotice={pendingSyncNotice}
        timerSeconds={timerSeconds}
        onRetry={handleRetry}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/student" className="text-xs text-slate/40" onClick={handleExit}>
            ← Thoát
          </Link>
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm">
            <span aria-hidden="true">⏱</span>
            <span className="text-sm font-bold text-pink-600 tabular-nums">
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>
        <div className="mb-6">
          <ProgressBar mode="steps" totalSteps={TOTAL_STEPS} currentStep={step} />
          <p className="text-center text-xs font-semibold text-slate/50 mt-2">
            Bước {step}/{TOTAL_STEPS} · {STEP_LABELS[step - 1]}
          </p>
        </div>
        {stepError && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2 mb-4 text-center">
            {stepError}
          </p>
        )}
        {step === 1 && (
          <FlashcardComponent
            vocabList={flashcardVocab}
            flippedIds={answers.flashcard.flippedIds}
            onFlip={(id) =>
              setAnswers((prev) => ({
                ...prev,
                flashcard: {
                  flippedIds: prev.flashcard.flippedIds.includes(id)
                    ? prev.flashcard.flippedIds
                    : [...prev.flashcard.flippedIds, id],
                },
              }))
            }
            onNext={() => goToStep(2)}
          />
        )}
        {step === 2 && (
          <MatchUpComponent
            vocabList={matchUpVocab}
            matchedPairs={answers.matchup.matchedPairs}
            onMatchChange={(pairs) =>
              setAnswers((prev) => ({ ...prev, matchup: { matchedPairs: pairs } }))
            }
            onNext={() => goToStep(3)}
          />
        )}
        {step === 3 && (
          <FillInBlanksComponent
            items={fillInItems}
            values={answers.fillblanks.values}
            onChange={(values) =>
              setAnswers((prev) => ({ ...prev, fillblanks: { values } }))
            }
            onNext={() => goToStep(4)}
          />
        )}
        {step === 4 && answers.mcq.shuffledQuestions && (
          <MCQComponent
            questions={answers.mcq.shuffledQuestions}
            selections={answers.mcq.selections}
            onSelect={(qid, idx) =>
              setAnswers((prev) => ({
                ...prev,
                mcq: {
                  ...prev.mcq,
                  selections: { ...prev.mcq.selections, [qid]: idx },
                },
              }))
            }
            onReshuffle={handleReshuffleMcq}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}