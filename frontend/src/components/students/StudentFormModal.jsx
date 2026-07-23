import React, { useEffect, useState } from "react";
import { Modal, Button, InputField } from "../ui";

 *
 * StudentFormModal — dùng chung cho cả "Thêm học sinh mới" và "Chỉnh sửa".
 * Nếu `student` có giá trị → chế độ sửa (điền sẵn dữ liệu); ngược lại → thêm mới.
 */
export default function StudentFormModal({ isOpen, student, classes, onClose, onSubmit }) {
  const [fullName, setFullName] = useState("");
  const [classId, setClassId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFullName(student?.full_name ?? "");
      setClassId(student?.class_id ?? classes[0]?.id ?? "");
      setError("");
    }
  }, [isOpen, student, classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({ full_name: fullName.trim(), class_id: classId });
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Họ và Tên"
          placeholder="Nhập họ và tên học sinh"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={error}
          autoFocus
         

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Khối lớp</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full h-11 rounded-2xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          >
            {classes.map((klass) => (
              <option key={klass.id} value={klass.id}>
                {klass.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isSaving}>
            {student ? "Lưu thay đổi" : "Thêm học sinh"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
