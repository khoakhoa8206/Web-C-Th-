import React, { useEffect, useState } from "react";
import { Button } from "../components/ui";
import Modal from "../components/ui/Modal";
import StudentsTable from "../components/students/StudentsTable";
import StudentFormModal from "../components/students/StudentFormModal";
import ConfirmDeleteModal from "../components/students/ConfirmDeleteModal";
import AddClassModal from "../components/students/AddClassModal";
import { useStudents } from "../hooks/useStudents";
import { fetchClasses, createClass, fetchSessionsForClass, deleteClass } from "../lib/sessionsApi";
import { fetchAttemptsForSession } from "../lib/attemptsApi";
import { exportRowsToCsv } from "../lib/csvExport";

function gradeLabel(classId, classes) {
  return classes.find((klass) => klass.id === classId)?.name ?? classId;
}

export default function ManageStudentsPage() {
  const [classes, setClasses] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const { students, isLoading, addStudent, editStudent, removeStudent } = useStudents(gradeId);

  const [formState, setFormState] = useState({ isOpen: false, student: null });
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [deleteClassTarget, setDeleteClassTarget] = useState(null); // class object
  const [deleteClassConfirm, setDeleteClassConfirm] = useState("");
  const [isDeletingClass, setIsDeletingClass] = useState(false);

  useEffect(() => {
    fetchClasses().then((data) => {
      setClasses(data);
      setGradeId((current) => current || data[0]?.id || "");
    });
  }, []);

  const handleAddClass = async (payload) => {
    const newClass = await createClass(payload);
    setClasses((current) => [...current, newClass].sort((a, b) => a.name.localeCompare(b.name)));
    setGradeId(newClass.id);
  };

  const handleDeleteClass = async () => {
    if (!deleteClassTarget) return;
    if (deleteClassConfirm.trim() !== deleteClassTarget.name.trim()) return;
    setIsDeletingClass(true);
    try {
      await deleteClass(deleteClassTarget.id);
      setClasses((prev) => prev.filter((c) => c.id !== deleteClassTarget.id));
      // Chuyển sang lớp đầu tiên còn lại
      const remaining = classes.filter((c) => c.id !== deleteClassTarget.id);
      setGradeId(remaining[0]?.id || "");
      setDeleteClassTarget(null);
      setDeleteClassConfirm("");
    } catch (err) {
      alert(err.message || "Xoá thất bại.");
    } finally {
      setIsDeletingClass(false);
    }
  };

  const handleSave = async (payload) => {
    if (formState.student) {
      await editStudent(formState.student.id, payload);
    } else {
      await addStudent(payload);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const sessions = await fetchSessionsForClass(gradeId);
      const attemptLists = await Promise.all(sessions.map((s) => fetchAttemptsForSession(s.id)));
      const allAttempts = attemptLists.flat();

      const rows = students.map((student) => {
        const studentAttempts = allAttempts.filter((a) => a.student_id === student.id);
        const latest = [...studentAttempts].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )[0];
        return {
          "Họ và Tên": student.full_name,
          "Khối lớp": gradeLabel(student.class_id, classes),
          "Số lần làm bài": studentAttempts.length,
          "Điểm gần nhất (%)": latest?.score ?? "",
          "Trạng thái": latest ? (latest.passed ? "Hoàn thành" : "Chưa đạt") : "Chưa làm bài",
        };
      });

      exportRowsToCsv(rows, `bao-cao-${gradeId}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-slate text-lg">Quản lý danh sách lớp học</h2>
          <p className="text-sm text-slate/50">Thêm, sửa, xoá học sinh và xuất báo cáo điểm.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportCsv} isLoading={isExporting}>
            📄 Xuất CSV
          </Button>
          <Button variant="primary" onClick={() => setFormState({ isOpen: true, student: null })}>
            + Thêm học sinh
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-xs">
        <label className="block text-xs font-semibold text-slate/50 mb-1">Khối lớp</label>
        <div className="flex gap-2">
          <select
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          >
            {classes.length === 0 && <option value="">Chưa có khối lớp</option>}
            {classes.map((klass) => (
              <option key={klass.id} value={klass.id}>
                {klass.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            className="!h-11 !w-11 shrink-0 !px-0"
            onClick={() => setIsAddClassOpen(true)}
            title="Thêm khối lớp"
          >
            +
          </Button>
        </div>
        {gradeId && classes.length > 0 && (
          <button
            className="text-xs text-danger-text hover:underline mt-1"
            onClick={() => setDeleteClassTarget(classes.find((c) => c.id === gradeId))}
          >
            Xoá khối này
          </button>
        )}
      </div>

      <StudentsTable
        students={students}
        classes={classes}
        isLoading={isLoading}
        onEdit={(student) => setFormState({ isOpen: true, student })}
        onDelete={setStudentToDelete}
      />

      <StudentFormModal
        isOpen={formState.isOpen}
        student={formState.student}
        classes={classes}
        onClose={() => setFormState({ isOpen: false, student: null })}
        onSubmit={handleSave}
      />

      <ConfirmDeleteModal
        student={studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={removeStudent}
      />

      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSubmit={handleAddClass}
      />

      <Modal
        isOpen={!!deleteClassTarget}
        onClose={() => {
          setDeleteClassTarget(null);
          setDeleteClassConfirm("");
        }}
        title="Xoá khối lớp"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="bg-danger-bg rounded-xl p-3 text-sm text-danger-text">
            ⚠️ <strong>Cảnh báo:</strong> Xoá khối lớp sẽ xoá cascade toàn bộ{" "}
            <strong>học sinh, bài tập và lịch sử làm bài</strong> của lớp này. Không thể hoàn tác.
          </div>
          <p className="text-sm text-slate">
            Gõ <strong>"{deleteClassTarget?.name}"</strong> để xác nhận:
          </p>
          <input
            className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm outline-none focus:border-danger"
            placeholder={deleteClassTarget?.name}
            value={deleteClassConfirm}
            onChange={(e) => setDeleteClassConfirm(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setDeleteClassTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={isDeletingClass}
              disabled={deleteClassConfirm.trim() !== deleteClassTarget?.name?.trim()}
              onClick={handleDeleteClass}
            >
              Xoá khối lớp
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
