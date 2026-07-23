import React, { useEffect, useState } from "react";
import { Button, CardContainer, InputField, Modal } from "../components/ui";
import { fetchClasses, createClass, updateClass, deleteClassById } from "../lib/sessionsApi";

 *
 * ManageClassesPage — quản lý danh sách khối lớp (CRUD).
 * Giáo viên phải tạo ít nhất 1 khối lớp trước khi thêm học sinh hoặc giao bài.
 */
export default function ManageClassesPage() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch (err) {
      console.error("Lỗi tải danh sách lớp:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleEdit = (klass) => {
    setEditingClass(klass);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteClassById(id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      alert(err.message || "Không thể xoá lớp học.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-slate-900 text-lg">Quản lý khối lớp</h2>
          <p className="text-sm text-slate-900">
            Tạo, sửa, xoá các khối lớp. Phải có ít nhất 1 khối lớp để thêm học sinh và giao bài.
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          + Thêm khối lớp
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-900 text-sm">Đang tải...</div>
      ) : classes.length === 0 ? (
        <CardContainer className="text-center py-12">
          <span className="text-4xl mb-3 block">📭</span>
          <p className="font-semibold text-slate-900 mb-1">Chưa có khối lớp nào</p>
          <p className="text-sm text-slate-900 mb-4">
            Hãy tạo khối lớp đầu tiên để bắt đầu thêm học sinh và giao bài.
          </p>
          <Button variant="primary" onClick={handleAdd}>
            + Tạo khối lớp đầu tiên
          </Button>
        </CardContainer>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((klass) => (
            <CardContainer key={klass.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{klass.name}</h3>
                  {klass.teacher_name && (
                    <p className="text-xs text-slate-900">GV: {klass.teacher_name}</p>
                  )}
                </div>
                <span className="text-2xl">🏫</span>
              </div>
              <p className="text-xs text-slate-900">
                Tạo lúc: {new Date(klass.created_at).toLocaleDateString("vi-VN")}
              </p>
              <div className="flex gap-2 mt-auto pt-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(klass)}>
                  ✏️ Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(klass)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑 Xoá
                </Button>
              </div>
            </CardContainer>
          ))}
        </div>
      )}

      {  Form thêm/sửa * 
      <ClassFormModal
        isOpen={formOpen}
        klass={editingClass}
        onClose={() => setFormOpen(false)}
        onSaved={reload}
       

      {  Xác nhận xoá * 
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá khối lớp"
      >
        <p className="text-sm text-slate-900 mb-4">
          Bạn có chắc muốn xoá lớp <strong>{deleteTarget?.name}</strong>?
          <br  
          <span className="text-red-500 font-semibold">
            Tất cả học sinh, buổi học và bài tập trong lớp này sẽ bị xoá vĩnh viễn.
          </span>
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setDeleteTarget(null)}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => handleDelete(deleteTarget.id)}
            className="!bg-red-500 hover:!bg-red-600"
          >
            Xoá lớp
          </Button>
        </div>
      </Modal>
    </div>
  );
}

 * Modal form thêm/sửa khối lớp */
function ClassFormModal({ isOpen, klass, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(klass?.name ?? "");
      setTeacherName(klass?.teacher_name ?? "");
      setError("");
    }
  }, [isOpen, klass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên khối lớp.");
      return;
    }
    setIsSaving(true);
    try {
      if (klass) {
        await updateClass(klass.id, {
          name: name.trim(),
          teacher_name: teacherName.trim() || null,
        });
      } else {
        await createClass({
          name: name.trim(),
          teacher_name: teacherName.trim() || null,
        });
      }
      onClose();
      await onSaved();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={klass ? "Chỉnh sửa khối lớp" : "Thêm khối lớp mới"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Tên khối lớp"
          placeholder="VD: Khối 3, Lớp 5A, ..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoFocus
         
        <InputField
          label="Tên giáo viên (tuỳ chọn)"
          placeholder="VD: Cô Hoa"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
         
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isSaving}>
            {klass ? "Lưu thay đổi" : "Tạo khối lớp"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
