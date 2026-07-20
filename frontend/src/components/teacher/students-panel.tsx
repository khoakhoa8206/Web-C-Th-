import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  CardContainer,
  InputField,
  Modal,
} from "@/components/vocab-ui";
import { ClassPicker } from "./class-picker";
import {
  createClass,
  createStudent,
  deleteStudent,
  fetchClasses,
  fetchStudents,
  updateStudent,
  type ClassRow,
  type StudentRow,
} from "@/lib/teacher-api";

export function StudentsPanel() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const [isAddClassOpen, setAddClassOpen] = useState(false);
  const [form, setForm] = useState<{ isOpen: boolean; student: StudentRow | null }>(
    { isOpen: false, student: null },
  );
  const [toDelete, setToDelete] = useState<StudentRow | null>(null);

  const classesQ = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  useEffect(() => {
    if (!classId && classesQ.data?.[0]) setClassId(classesQ.data[0].id);
  }, [classesQ.data, classId]);

  const studentsQ = useQuery({
    queryKey: ["students", classId],
    queryFn: () => fetchStudents(classId),
    enabled: !!classId,
  });

  const addClass = useMutation({
    mutationFn: (name: string) => createClass(name),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      setClassId(c.id);
      setAddClassOpen(false);
    },
  });

  const saveStudent = useMutation({
    mutationFn: (payload: {
      id?: string;
      full_name: string;
      class_id: string;
    }) =>
      payload.id
        ? updateStudent(payload.id, {
            full_name: payload.full_name,
            class_id: payload.class_id,
          })
        : createStudent({
            full_name: payload.full_name,
            class_id: payload.class_id,
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      setForm({ isOpen: false, student: null });
    },
  });

  const removeStudent = useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      setToDelete(null);
    },
  });

  const classLabel = (id: string) =>
    (classesQ.data || []).find((c) => c.id === id)?.name ?? id;

  const students = studentsQ.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-slate text-lg">Quản lý học sinh</h2>
          <p className="text-sm text-slate/50">
            Thêm, sửa, xoá học sinh theo từng khối lớp.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setForm({ isOpen: true, student: null })}
          disabled={!classId}
        >
          + Thêm học sinh
        </Button>
      </div>

      <div className="mb-4 max-w-xs">
        <ClassPicker
          classes={classesQ.data || []}
          value={classId}
          onChange={setClassId}
          onAddClick={() => setAddClassOpen(true)}
        />
      </div>

      {students.length === 0 ? (
        <CardContainer className="text-center py-10">
          <p className="text-sm text-slate/40">
            {studentsQ.isLoading
              ? "Đang tải..."
              : 'Chưa có học sinh. Bấm "Thêm học sinh" để bắt đầu.'}
          </p>
        </CardContainer>
      ) : (
        <CardContainer padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-soft text-left text-xs font-bold text-slate/50 uppercase tracking-wide">
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-4 py-3">Khối lớp</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-surface-border last:border-0"
                  >
                    <td className="px-4 py-3 font-semibold text-slate">
                      {s.full_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-pink-50 text-pink-600 text-xs font-bold rounded-full px-3 py-1">
                        {classLabel(s.class_id)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setForm({ isOpen: true, student: s })}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setToDelete(s)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContainer>
      )}

      <StudentFormModal
        isOpen={form.isOpen}
        student={form.student}
        classes={classesQ.data || []}
        defaultClassId={classId}
        onClose={() => setForm({ isOpen: false, student: null })}
        onSubmit={(payload) => saveStudent.mutate(payload)}
        isSaving={saveStudent.isPending}
      />

      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Xoá học sinh"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate">
            Xác nhận xoá <strong>{toDelete?.full_name}</strong>? Không thể hoàn
            tác.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setToDelete(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={removeStudent.isPending}
              onClick={() => toDelete && removeStudent.mutate(toDelete.id)}
            >
              Xoá
            </Button>
          </div>
        </div>
      </Modal>

      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setAddClassOpen(false)}
        onSubmit={(name) => addClass.mutate(name)}
        isSaving={addClass.isPending}
      />
    </div>
  );
}

function StudentFormModal({
  isOpen,
  student,
  classes,
  defaultClassId,
  onClose,
  onSubmit,
  isSaving,
}: {
  isOpen: boolean;
  student: StudentRow | null;
  classes: ClassRow[];
  defaultClassId: string;
  onClose: () => void;
  onSubmit: (p: { id?: string; full_name: string; class_id: string }) => void;
  isSaving: boolean;
}) {
  const [fullName, setFullName] = useState("");
  const [classId, setClassId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFullName(student?.full_name || "");
    setClassId(student?.class_id || defaultClassId || "");
    setError(null);
  }, [isOpen, student, defaultClassId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return setError("Vui lòng nhập họ tên.");
    if (!classId) return setError("Vui lòng chọn khối lớp.");
    onSubmit({
      id: student?.id,
      full_name: fullName.trim(),
      class_id: classId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? "Sửa học sinh" : "Thêm học sinh"}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoFocus
        />
        <div>
          <label className="block text-sm font-semibold text-slate mb-1.5">
            Khối lớp
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          >
            <option value="">Chọn lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs font-medium text-danger-text">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth type="button" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            fullWidth
            type="submit"
            isLoading={isSaving}
          >
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AddClassModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState("");
  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm khối lớp"
      maxWidth="max-w-sm"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSubmit(name.trim());
        }}
        className="space-y-4"
      >
        <InputField
          label="Tên khối lớp"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vd: Lớp 5A"
          autoFocus
        />
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth type="button" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            fullWidth
            type="submit"
            isLoading={isSaving}
            disabled={!name.trim()}
          >
            Tạo
          </Button>
        </div>
      </form>
    </Modal>
  );
}