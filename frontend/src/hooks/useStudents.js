import { useCallback, useEffect, useState } from "react";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../lib/studentsApi";

export function useStudents(classId) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchStudents(classId);
    setStudents(data);
    setIsLoading(false);
  }, [classId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addStudent = useCallback(
    async (payload) => {
      await createStudent(payload);
      await reload();
    },
    [reload]
  );

  const editStudent = useCallback(
    async (id, patch) => {
      await updateStudent(id, patch);
      await reload();
    },
    [reload]
  );

  const removeStudent = useCallback(
    async (id) => {
      await deleteStudent(id);
      await reload();
    },
    [reload]
  );

  return { students, isLoading, addStudent, editStudent, removeStudent, reload };
}
