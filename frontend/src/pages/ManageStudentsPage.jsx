import React, { useEffect, useState } from "react";
import { Button } from "../components/ui";
import StudentsTable from "../components/students/StudentsTable";
import StudentFormModal from "../components/students/StudentFormModal";
import ConfirmDeleteModal from "../components/students/ConfirmDeleteModal";
import { useStudents } from "../hooks/useStudents";
import { fetchClasses, fetchSessionsForClass } from "../lib/sessionsApi";
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

  useEffect(() => {
    fetchClasses().then((data) => {
      setClasses(data);
      setGradeId((current) => current || data[0]?.id || "");
    });
  }, []);

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
        <select
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
        >
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>
              {klass.name}
            </option>
          ))}
        </select>
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
    </div>
  );
}
