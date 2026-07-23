import React, { useEffect, useState } from "react";
import FilterBar from "../components/dashboard/FilterBar";
import StudentTable from "../components/dashboard/StudentTable";
import StudentHistoryModal from "../components/dashboard/StudentHistoryModal";
import { fetchClasses, fetchSessionsForClass } from "../lib/sessionsApi";
import { fetchStudents } from "../lib/studentsApi";
import { useAttemptsRealtime } from "../hooks/useAttemptsRealtime";

export default function DashboardPage() {
  const [classes, setClasses] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { attemptsByStudent, isLoading: isLoadingAttempts } = useAttemptsRealtime(sessionId);

  useEffect(() => {
    fetchClasses().then((data) => {
      const options = data.map((klass) => ({ id: klass.id, label: klass.name }));
      setClasses(options);
      setGradeId((current) => current || options[0]?.id || "");
    });
  }, []);

  // Tải danh sách buổi học khi đổi khối lớp
  useEffect(() => {
    if (!gradeId) return;
    fetchSessionsForClass(gradeId).then((data) => {
      setSessions(data);
      setSessionId(data[0]?.id ?? null);
    });
  }, [gradeId]);

  // Tải danh sách học sinh của khối lớp
  useEffect(() => {
    if (!gradeId) return;
    setIsLoadingStudents(true);
    fetchStudents(gradeId).then((data) => {
      setStudents(data);
      setIsLoadingStudents(false);
    });
  }, [gradeId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="font-bold text-slate text-lg">Theo dõi tiến độ theo thời gian thực</h2>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Hàng sẽ tự cập nhật màu sắc và điểm số ngay khi học sinh nộp bài, không cần tải lại trang.
      </p>

      <FilterBar
        grades={classes}
        sessions={sessions}
        selectedGradeId={gradeId}
        selectedSessionId={sessionId}
        onGradeChange={setGradeId}
        onSessionChange={setSessionId}
      />

      <StudentTable
        students={students}
        attemptsByStudent={attemptsByStudent}
        isLoading={isLoadingStudents || isLoadingAttempts}
        onClickName={setSelectedStudent}
      />

      <StudentHistoryModal
        student={selectedStudent}
        sessionId={sessionId}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
