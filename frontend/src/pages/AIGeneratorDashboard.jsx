import React, { useEffect, useRef, useState } from "react";
import VocabInputStep from "../components/ai-generator/VocabInputStep";
import LoadingStep from "../components/ai-generator/LoadingStep";
import PreviewEditStep from "../components/ai-generator/PreviewEditStep";
import AddClassModal from "../components/students/AddClassModal";
import { fetchClasses, createClass } from "../lib/sessionsApi";
import { generateLessonFromVocab, updateExercises, publishSession, scheduleSession } from "../lib/aiGeneratorApi";

 *
 * AIGeneratorDashboard — Tab "Soạn bài bằng AI".
 * State machine 4 bước: input → loading → preview (bao gồm cả bước 4: kích hoạt).
 */
export default function AIGeneratorDashboard() {
  const [step, setStep] = useState("input");   input | loading | preview
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [vocabText, setVocabText] = useState("");
  const [lessonData, setLessonData] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(null);   null | "DRAFT" | "PUBLISHED"
  const [savedStatus, setSavedStatus] = useState(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [publishDeadline, setPublishDeadline] = useState("");
    true nếu bước "lưu nội dung bài tập" (updateExercises) đã thành công nhưng
    "giao bài" (publishSession) thất bại — cho phép bấm lại chỉ để thử giao bài,
    tránh gọi lại updateExercises không cần thiết.
  const [exercisesSavedPendingPublish, setExercisesSavedPendingPublish] = useState(false);
    Khoá đồng bộ (không phụ thuộc re-render) để chặn double-click gọi API trùng lặp.
  const savingLockRef = useRef(false);

  useEffect(() => {
    fetchClasses()
      .then((data) => {
        setClasses(data);
        setClassId((current) => current || data[0]?.id || "");
      })
      .catch((err) => setError(err.message || "Không thể tải danh sách lớp."));
  }, []);

  const handleGenerate = async () => {
    setError("");
    setStep("loading");
    try {
      const data = await generateLessonFromVocab(vocabText, classId);
      setLessonData(data);
      setSessionId(data.session_id);
      setSavedStatus(null);
      setStep("preview");
    } catch (err) {
      setError(err.message || "Có lỗi khi tạo bài học.");
      setStep("input");
    }
  };

  const handleAddClass = async (payload) => {
    const newClass = await createClass(payload);
    setClasses((current) => [...current, newClass].sort((a, b) => a.name.localeCompare(b.name)));
    setClassId(newClass.id);
  };

  const handleChangeSection = (section, items) => {
    setLessonData((prev) => ({ ...prev, [section]: items }));
      Nội dung vừa đổi nên nếu trước đó đang ở trạng thái "chỉ cần giao bài",
      phải lưu lại nội dung mới trước khi giao.
    setExercisesSavedPendingPublish(false);
  };

  const handleSave = async (status) => {
      Chặn double-click  bấm nhiều lần
    if (savingLockRef.current) return;
    savingLockRef.current = true;

    setIsSaving(status);
    setSavedStatus(null);
    setError("");
    try {
      const deadlineISO = publishDeadline ? new Date(publishDeadline).toISOString() : null;

      if (!(exercisesSavedPendingPublish && status === "PUBLISHED")) {
        await updateExercises(sessionId, lessonData);
        setExercisesSavedPendingPublish(true);
      }

      if (status === "PUBLISHED") {
        try {
          await publishSession(sessionId, deadlineISO);
        } catch (publishErr) {
          setError(
            (publishErr.message ? `Giao bài thất bại: ${publishErr.message}. ` : "Giao bài thất bại. ") +
              "Nội dung bài tập đã được lưu — bấm \"Giao bài tập ngay\" để thử giao lại mà không cần lưu lại nội dung."
          );
          return;
        }
      }

      setExercisesSavedPendingPublish(false);
      setSavedStatus(status);
    } catch (err) {
      setError(err.message || "Không thể lưu nội dung bài tập. Vui lòng thử lại.");
    } finally {
      setIsSaving(null);
      savingLockRef.current = false;
    }
  };

  const handleSchedule = async (scheduledAt, deadline) => {
    if (savingLockRef.current) return;
    savingLockRef.current = true;

    setIsSaving("SCHEDULED");
    setSavedStatus(null);
    setError("");
    try {
        Lưu nội dung trước khi đặt lịch (nếu chưa lưu lần này)
      if (!exercisesSavedPendingPublish) {
        await updateExercises(sessionId, lessonData);
        setExercisesSavedPendingPublish(true);
      }
      const deadlineISO = deadline ? new Date(deadline).toISOString() : null;
      await scheduleSession(sessionId, new Date(scheduledAt).toISOString(), deadlineISO);
      setExercisesSavedPendingPublish(false);
      setSavedStatus("SCHEDULED");
    } catch (err) {
      setError(err.message || "Không thể đặt lịch hẹn giờ giao bài. Vui lòng thử lại.");
    } finally {
      setIsSaving(null);
      savingLockRef.current = false;
    }
  };

  return (
    <div>
      {step === "input" && (
        <>
          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2 mb-4 max-w-2xl mx-auto">
              {error}
            </p>
          )}
          <VocabInputStep
            classes={classes}
            classId={classId}
            onClassChange={setClassId}
            onAddClass={() => setIsAddClassOpen(true)}
            vocabText={vocabText}
            onVocabTextChange={setVocabText}
            onGenerate={handleGenerate}
           
        < 
      )}

      {step === "loading" && <LoadingStep  }

      {step === "preview" && lessonData && (
        <>
          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2 mb-4 max-w-3xl mx-auto">
              {error}
            </p>
          )}
          <PreviewEditStep
            lessonData={lessonData}
            onChangeSection={handleChangeSection}
            onSaveDraft={() => handleSave("DRAFT")}
            onPublish={() => handleSave("PUBLISHED")}
            onSchedule={handleSchedule}
            isSaving={isSaving}
            savedStatus={savedStatus}
            publishDeadline={publishDeadline}
            onDeadlineChange={setPublishDeadline}
           
        < 
      )}

      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSubmit={handleAddClass}
       
    </div>
  );
}
