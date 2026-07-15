import React, { useEffect, useState } from "react";
import { Modal, Button, InputField } from "../ui";

/**
 * AddClassModal — form tạo mới một khối/lớp học (VD: "Khối 8", "Lớp 8A1").
 */
export default function AddClassModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setTeacherName("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên khối lớp.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), teacher_name: teacherName.trim() });
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm khối lớp mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Tên khối lớp"
          placeholder="VD: Lớp 8A1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoFocus
        />
        <InputField
          label="Giáo viên phụ trách (tuỳ chọn)"
          placeholder="VD: Cô Lan"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isSaving}>
            Thêm khối lớp
          </Button>
        </div>
      </form>
    </Modal>
  );
}
