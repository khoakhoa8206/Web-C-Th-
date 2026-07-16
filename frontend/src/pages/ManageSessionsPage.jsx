import React, { useEffect, useState } from "react";
import { CardContainer, Button, InputField } from "../components/ui";
import {
  fetchClasses,
  fetchSessionsForClass,
  updateSession,
  deleteSession,
  publishExistingSession,
} from "../lib/sessionsApi";
import Modal from "../components/ui/Modal";

function formatDeadline(iso) {
  if (!iso) return "Không giới hạn";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toLocalDatetimeValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * ManageSessionsPage — Giáo viên xem, sửa, xoá bài tập.
 */
export default function ManageSessionsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null); // session object
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Publish modal
  const [publishTarget, setPublishTarget] = useState(null);
  const [publishDeadline, setPublishDeadline] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchClasses().then(setClasses);
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setSessions([]);
      return;
    }
    setIsLoadingSessions(true);
    fetchSessionsForClass(selectedClassId)
      .then(setSessions)
      .finally(() => setIsLoadingSessions(false));
  }, [selectedClassId]);

  const openEdit = (s) => {
    setEditTarget(s);
    setEditTitle(s.title);
    setEditDeadline(toLocalDatetimeValue(s.deadline));
    setEditError("");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setEditError("Tên bài tập không được để trống.");
      return;
    }
    setIsSaving(true);
    setEditError("");
    try {
      const deadlineISO = editDeadline ? new Date(editDeadline).toISOString() : null;
      await updateSession(editTarget.id, { title: editTitle.trim(), deadline: deadlineISO });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editTarget.id
            ? { ...s, title: editTitle.trim(), deadline: deadlineISO }
            : s
        )
      );
      setEditTarget(null);
    } catch (err) {
      setEditError(err.message || "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    setIsPublishing(true);
    try {
      const deadlineISO = publishDeadline ? new Date(publishDeadline).toISOString() : null;
      await publishExistingSession(publishTarget.id, deadlineISO);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === publishTarget.id
            ? { ...s, status: "PUBLISHED", published_at: new Date().toISOString(), deadline: deadlineISO }
            : s
        )
      );
      setPublishTarget(null);
      setPublishDeadline("");
    } catch (err) {
      alert(err.message || "Giao bài thất bại.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSession(deleteTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || "Xoá thất bại.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate mb-1">Quản lý bài tập</h2>
        <p className="text-sm text-slate/50">Sửa tên, đặt hạn nộp, hoặc xoá bài tập theo khối lớp.</p>
      </div>

      {/* Chọn lớp */}
      <div className="max-w-xs">
        <label className="text-sm font-semibold text-slate block mb-1.5">Chọn khối lớp</label>
        <select
          className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">— Chọn lớp —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách session */}
      {isLoadingSessions && (
        <p className="text-sm text-slate/50">Đang tải danh sách bài tập...</p>
      )}

      {!isLoadingSessions && selectedClassId && sessions.length === 0 && (
        <p className="text-sm text-slate/50">Chưa có bài tập nào cho lớp này.</p>
      )}

      {sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((s) => (
            <CardContainer key={s.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate truncate">{s.title}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.status === "PUBLISHED"
                        ? "bg-success-bg text-success-text"
                        : "bg-warning-bg text-warning-text"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-slate/50 mt-0.5">
                  Hạn nộp: {formatDeadline(s.deadline)}
                  {s.published_at && (
                    <> · Giao: {new Date(s.published_at).toLocaleDateString("vi-VN")}</>
                  )}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {s.status === "DRAFT" && (
                  <Button variant="primary" size="sm" onClick={() => setPublishTarget(s)}>
                    Giao bài ▶
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-text hover:bg-danger-bg"
                  onClick={() => setDeleteTarget(s)}
                >
                  Xoá
                </Button>
              </div>
            </CardContainer>
          ))}
        </div>
      )}

      {/* Modal sửa */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Sửa bài tập"
      >
        <div className="space-y-4">
          <InputField
            label="Tên chủ đề"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            error={editError}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate">Hạn nộp bài (tuỳ chọn)</label>
            <input
              type="datetime-local"
              className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
            />
            {editDeadline && (
              <button
                type="button"
                className="text-xs text-slate/40 hover:text-danger-text text-left"
                onClick={() => setEditDeadline("")}
              >
                ✕ Xoá deadline (không giới hạn)
              </button>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setEditTarget(null)}>
              Huỷ
            </Button>
            <Button variant="primary" fullWidth isLoading={isSaving} onClick={handleSaveEdit}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận giao bài */}
      <Modal
        isOpen={!!publishTarget}
        onClose={() => {
          setPublishTarget(null);
          setPublishDeadline("");
        }}
        title="Giao bài tập"
      >
        <p className="text-sm text-slate/70 mb-4">
          Giao bài <strong>"{publishTarget?.title}"</strong> cho học sinh?
        </p>
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-sm font-semibold text-slate">Hạn nộp (tuỳ chọn)</label>
          <input
            type="datetime-local"
            className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
            value={publishDeadline}
            onChange={(e) => setPublishDeadline(e.target.value)}
          />
          {publishDeadline && (
            <button
              type="button"
              className="text-xs text-slate/40 text-left hover:text-danger-text"
              onClick={() => setPublishDeadline("")}
            >
              ✕ Xoá deadline
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setPublishTarget(null)}>
            Huỷ
          </Button>
          <Button variant="primary" fullWidth isLoading={isPublishing} onClick={handlePublish}>
            Xác nhận giao bài
          </Button>
        </div>
      </Modal>

      {/* Modal xác nhận xoá */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xoá bài tập"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-slate/70 mb-6">
          Bạn chắc chắn muốn xoá bài tập{" "}
          <span className="font-bold text-slate">"{deleteTarget?.title}"</span>? Hành động này sẽ xoá
          luôn toàn bộ điểm số và lịch sử làm bài của học sinh và{" "}
          <span className="font-bold text-danger-text">KHÔNG THỂ hoàn tác</span>.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setDeleteTarget(null)}>
            Huỷ
          </Button>
          <Button
            variant="danger"
            fullWidth
            isLoading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Xoá bài tập
          </Button>
        </div>
      </Modal>
    </div>
  );
}
