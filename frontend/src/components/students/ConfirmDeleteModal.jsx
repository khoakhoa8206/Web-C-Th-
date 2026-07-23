import React, { useState } from "react";
import { Modal, Button } from "../ui";

export default function ConfirmDeleteModal({ student, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isOpen = !!student;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(student.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xoá học sinh" maxWidth="max-w-sm">
      <p className="text-sm text-slate-700 mb-6">
        Bạn có chắc muốn xoá <span className="font-bold text-slate">{student?.full_name}</span> khỏi lớp
        học? Hành động này không thể hoàn tác.
      </p>
      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={onClose}>
          Huỷ
        </Button>
        <Button variant="danger" fullWidth isLoading={isDeleting} onClick={handleConfirm}>
          Xoá học sinh
        </Button>
      </div>
    </Modal>
  );
}
