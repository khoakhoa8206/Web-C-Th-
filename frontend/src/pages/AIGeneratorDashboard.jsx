import React, { useEffect, useState } from "react";
import VocabInputStep from "../components/ai-generator/VocabInputStep";
import LoadingStep from "../components/ai-generator/LoadingStep";
import PreviewEditStep from "../components/ai-generator/PreviewEditStep";
import AddClassModal from "../components/students/AddClassModal";
import { fetchClasses, createClass } from "../lib/sessionsApi";
import { generateLessonFromVocab, saveLesson } from "../lib/aiGeneratorApi";

/**
 * AIGeneratorDashboard — Tab "Soạn bài bằng AI".
 * State machine 4 bước: input → loading → preview (bao gồm cả bước 4: kích hoạt).
 */
export default function AIGeneratorDashboard() {
  const [step, setStep] = useState("input"); // input | loading | preview
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [vocabText, setVocabText] = useState("");
  const [lessonData, setLessonData] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(null); // null | "DRAFT" | "PUBLISHED"
  const [savedStatus, setSavedStatus] = useState(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

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
  };

  const handleSave = async (status) => {
    setIsSaving(status);
    setSavedStatus(null);
    try {
      await saveLesson(sessionId, lessonData, status);
      setSavedStatus(status);
    } catch (err) {
      setError(err.message || "Không thể lưu bài học.");
    } finally {
      setIsSaving(null);
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
          />
        </>
      )}

      {step === "loading" && <LoadingStep />}

      {step === "preview" && lessonData && (
        <PreviewEditStep
          lessonData={lessonData}
          onChangeSection={handleChangeSection}
          onSaveDraft={() => handleSave("DRAFT")}
          onPublish={() => handleSave("PUBLISHED")}
          isSaving={isSaving}
          savedStatus={savedStatus}
        />
      )}

      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSubmit={handleAddClass}
      />
    </div>
  );
}
