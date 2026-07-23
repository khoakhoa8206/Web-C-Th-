import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, ProgressBar, CardContainer } from "../ui";
import FlashcardComponent from "./FlashcardComponent";
import MatchUpComponent from "./MatchUpComponent";
import FillInBlanksComponent from "./FillInBlanksComponent";
import MCQComponent from "./MCQComponent";
import ResultScreen from "./ResultScreen";
import VocabReviewStep from "./VocabReviewStep";
import { startAttempt, updateAttemptStep, submitAttempt } from "../../lib/studentPracticeApi";
import { shuffleMcqQuestions } from "../../utils/shuffle";

const TOTAL_STEPS = 4;
const STEP_LABELS = ["Flashcard", "Nối từ", "Điền từ", "Trắc nghiệm"];

function draftKey(sessionId) {
  return `draft_session_${sessionId}`;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function loadDraft(sessionId) {
  try {
    const raw = localStorage.getItem(draftKey(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function makeInitialAnswers() {
  return {
    flashcard: { flippedIds: [] },
    matchup: { matchedPairs: {} },
    fillblanks: { values: {} },
    mcq: { shuffledQuestions: null, selections: {} },
  };
}

/**
 * PracticeFlow v2 — luồng làm bài 4 bước.
 *
 * Improvements:
 * 1. handleRetryMcqOnly(): Chỉ làm lại MCQ (step = 4), giữ answers của step 1-3
 * 2. handleRetryFromStart(): Reset toàn bộ + step = 1
 * 3. Truyền onRetryMcqOnly xuống ResultScreen
 *
 * Props: { sessionId, exercises }
 * exercises = { flashcards, match_up, fill_in_blanks, mcqs } từ backend.
 */
export default function PracticeFlow({ sessionId, exercises }) {
  const draft = useMemo(() => loadDraft(sessionId), [sessionId]);

  const [phase, setPhase] = useState(draft?.phase ?? "ready");
  const [step, setStep] = useState(draft?.step ?? 1);
  const [timerSeconds, setTimerSeconds] = useState(draft?.timerSeconds ?? 0);
  const [answers, setAnswers] = useState(draft?.answers ?? makeInitialAnswers());
  const [result, setResult] = useState(draft?.result ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(draft?.attemptId ?? null);
  const [pendingSyncNotice, setPendingSyncNotice] = useState(false);
  const [stepError, setStepError] = useState(null);

  const intervalRef = useRef(null);

  // ---- Adapt exercises data cho từng component ----
  const flashcardVocab = useMemo(
    () =>
      (exercises.flashcards || []).map((f) => ({
        id: f.id,
        word: f.word,
        meaning: f.meaning,
        phonetic: f.example ? `Ví dụ: ${f.example}` : "",
      })),
    [exercises.flashcards]
  );

  const matchUpVocab = useMemo(
    () =>
      (exercises.match_up || []).map((m) => ({
        id: m.id,
        word: m.term,
        meaning: m.definition,
      })),
    [exercises.match_up]
  );

  const fillInItems = useMemo(() => exercises.fill_in_blanks || [], [exercises.fill_in_blanks]);

  const mcqQuestions = useMemo(
    () =>
      (exercises.mcqs || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options.map((text) => ({ text })),
        correctIndex: q.options.indexOf(q.correct_answer),
      })),
    [exercises.mcqs]
  );

  // ---- Timer chạy ngầm khi phase === "playing" ----
  useEffect(() => {
    if (phase !== "playing") return undefined;
    intervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  // ---- Lưu Draft vào LocalStorage ----
  useEffect(() => {
    if (phase === "ready" || phase === "playing" || phase === "result") {
      localStorage.setItem(
        draftKey(sessionId),
        JSON.stringify({ phase, step, timerSeconds, answers, result, attemptId })
      );
    }
  }, [sessionId, phase, step, timerSeconds, answers, result, attemptId]);

  // ---- BẮT ĐẦU LÀM BÀI: tạo attempt trên server ----
  const handleReady = useCallback(async () => {
    setStepError(null);
    try {
      const data = await startAttempt(sessionId);
      setAttemptId(data.attempt_id);
      setPhase("playing");
    } catch (err) {
      setStepError(err.message || "Không thể bắt đầu làm bài. Vui lòng thử lại.");
    }
  }, [sessionId]);

  const updateAnswers = useCallback((section, updater) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: typeof updater === "function" ? updater(prev[section]) : updater,
    }));
  }, []);

  // ---- Chuyển bước: gọi updateAttemptStep trên server ----
  const goToStep = useCallback(
    async (nextStep) => {
      setStepError(null);
      if (attemptId) {
        try {
          await updateAttemptStep(attemptId, nextStep);
        } catch (err) {
          setStepError(err.message || "Không thể chuyển bước.");
          return;
        }
      }
      setStep(nextStep);
    },
    [attemptId]
  );

  // ---- Chuẩn bị MCQ khi vào bước 4 ----
  useEffect(() => {
    if (step === 4 && phase === "playing" && !answers.mcq.shuffledQuestions && mcqQuestions.length > 0) {
      updateAnswers("mcq", (prev) => ({
        ...prev,
        shuffledQuestions: shuffleMcqQuestions(mcqQuestions),
      }));
    }
  }, [step, phase, mcqQuestions, answers.mcq.shuffledQuestions, updateAnswers]);

  const handleReshuffleMcq = useCallback(() => {
    updateAnswers("mcq", (prev) => ({
      shuffledQuestions: shuffleMcqQuestions(prev.shuffledQuestions || mcqQuestions),
      selections: {},
    }));
  }, [updateAnswers, mcqQuestions]);

  // ---- NỘP BÀI: thu thập answers, gọi submitAttempt ----
  const handleSubmitMcq = useCallback(async () => {
    setIsSubmitting(true);
    setStepError(null);

    // Thu thập match_up answers
    const matchUpAnswers = Object.entries(answers.matchup.matchedPairs).map(
      ([id, matched_id]) => ({ id, matched_id })
    );

    // Thu thập fill_in_blanks answers
    const fillAnswers = Object.entries(answers.fillblanks.values).map(([id, val]) => ({
      id,
      student_answer: val,
    }));

    // Thu thập mcqs answers: map selection index → option text
    const { shuffledQuestions, selections } = answers.mcq;
    const mcqAnswers = Object.entries(selections).map(([questionId, optionIndex]) => {
      const question = (shuffledQuestions || []).find((q) => q.id === questionId);
      const optionText = question?.options?.[optionIndex]?.text || "";
      return { id: questionId, student_answer: optionText };
    });

    const serverAnswers = {
      match_up: matchUpAnswers,
      fill_in_blanks: fillAnswers,
      mcqs: mcqAnswers,
    };

    try {
      const serverResult = await submitAttempt(attemptId, serverAnswers, timerSeconds);

      setResult({
        score: serverResult.accuracy,
        passed: serverResult.status === "PASSED",
        correctCount: serverResult.correct_count,
        total: serverResult.total_questions,
        gradedAnswers: (serverResult.results || []).map((r, idx) => ({
          questionId: r.id || `r${idx}`,
          isCorrect: r.is_correct,
          selectedAnswer: r.student_answer,
          correctAnswer: r.correct_answer || r.correct_answer_id,
          type: r.type,
          question: r.question || r.sentence || r.term,
        })),
        pending: false,
      });
      setPendingSyncNotice(false);
    } catch (err) {
      setStepError(err.message || "Lỗi khi nộp bài.");
      // Chấm điểm cục bộ nếu server lỗi
      const gradedLocal = (shuffledQuestions || []).map((q) => ({
        questionId: q.id,
        selectedIndex: selections[q.id] ?? -1,
        correctIndex: q.correctIndex,
        isCorrect: selections[q.id] === q.correctIndex,
      }));
      const localCorrect = gradedLocal.filter((a) => a.isCorrect).length;
      const localScore = gradedLocal.length > 0 ? Math.round((localCorrect / gradedLocal.length) * 100) : 0;
      setResult({
        score: localScore,
        passed: localScore >= 80,
        correctCount: localCorrect,
        total: gradedLocal.length,
        gradedAnswers: gradedLocal,
        pending: true,
      });
      setPendingSyncNotice(true);
    } finally {
      setIsSubmitting(false);
      setPhase("result");
      clearInterval(intervalRef.current);
    }
  }, [answers, attemptId, timerSeconds]);

  // ---- RETRY MCQ ONLY ----
  // Chỉ xoá MCQ selections + shuffle lại, giữ answers từ step 1-3
  // Không tạo attempt mới — dùng attempt hiện tại
  const handleRetryMcqOnly = useCallback(() => {
    setResult(null);
    setPhase("playing");
    setStep(4);
    // Reset MCQ selections, nhưng giữ shuffledQuestions
    updateAnswers("mcq", (prev) => ({
      ...prev,
      selections: {},
    }));
    // Bắt đầu timer lại
    setTimerSeconds(0);
  }, [updateAnswers]);

  // ---- RETRY FROM START ----
  // Reset toàn bộ, tạo attempt mới
  const handleRetryFromStart = useCallback(() => {
    setAnswers(makeInitialAnswers());
    setResult(null);
    setAttemptId(null);
    setTimerSeconds(0);
    setStep(1);
    setPhase("ready");
  }, []);

  const handleExitAndClearDraft = useCallback(() => {
    localStorage.removeItem(draftKey(sessionId));
  }, [sessionId]);

  // ================== MÀN HÌNH: CHƯA BẮT ĐẦU (Ôn từ vựng) ==================
  if (phase === "ready") {
    return (
      <VocabReviewStep
        vocabList={flashcardVocab}
        onReady={handleReady}
        stepError={stepError}
      />
    );
  }

  // ================== MÀN HÌNH: KẾT QUẢ ==================
  if (phase === "result" && result) {
    return (
      <ResultScreen
        result={result}
        pendingSyncNotice={pendingSyncNotice}
        timerSeconds={timerSeconds}
        onRetry={handleRetryFromStart}
        onRetryMcqOnly={handleRetryMcqOnly}
        onExit={handleExitAndClearDraft}
      />
    );
  }

  // ================== MÀN HÌNH: ĐANG LÀM BÀI ==================
  return (
    <div className="min-h-screen bg-pink-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header: timer + progress */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/student" className="text-xs text-slate/70" onClick={handleExitAndClearDraft}>
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
          <p className="text-center text-xs font-semibold text-slate/70 mt-2">
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
              updateAnswers("flashcard", (prev) => ({
                flippedIds: prev.flippedIds.includes(id)
                  ? prev.flippedIds
                  : [...prev.flippedIds, id],
              }))
            }
            onNext={() => goToStep(2)}
          />
        )}

        {step === 2 && (
          <MatchUpComponent
            vocabList={matchUpVocab}
            matchedPairs={answers.matchup.matchedPairs}
            onMatchChange={(pairs) => updateAnswers("matchup", { matchedPairs: pairs })}
            onNext={() => goToStep(3)}
          />
        )}

        {step === 3 && (
          <FillInBlanksComponent
            items={fillInItems}
            values={answers.fillblanks.values}
            onChange={(values) => updateAnswers("fillblanks", { values })}
            onNext={() => goToStep(4)}
          />
        )}

        {step === 4 && answers.mcq.shuffledQuestions && (
          <MCQComponent
            questions={answers.mcq.shuffledQuestions}
            selections={answers.mcq.selections}
            onSelect={(questionId, optionIndex) =>
              updateAnswers("mcq", (prev) => ({
                ...prev,
                selections: { ...prev.selections, [questionId]: optionIndex },
              }))
            }
            onReshuffle={handleReshuffleMcq}
            onSubmit={handleSubmitMcq}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
