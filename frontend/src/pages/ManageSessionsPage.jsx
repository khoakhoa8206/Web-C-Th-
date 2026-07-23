import React, { useEffect, useState } from "react";
import { CardContainer, Button, InputField } from "../components/ui";
import {
  fetchClasses,
  fetchSessionsForClass,
  updateSession,
  deleteSession,
  publishExistingSession,
  scheduleSessionPublish,
  cancelScheduledPublish,
} from "../lib/sessionsApi";
import Modal from "../components/ui/Modal";
import EditSessionExercisesPanel from "../components/sessions/EditSessionExercisesPanel";

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

  Hiển thị giá trị "đã chốt" của ô datetime-local (vd: "20 2026 23:59") cho badge xác nhận
function formatLocalDatetimeValue(value) {
  if (!value) return "Không giới hạn";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Không giới hạn";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

 *
 * ManageSessionsPage — Giáo viên xem, sửa, xoá bài tập.
 */
export default function ManageSessionsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    Edit modal
  const [editTarget, setEditTarget] = useState(null);   session object
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
    Deadline đã "chốt" (bấm Xác nhận) cho từng session — giữ nguyên dù modal
    đóng/mở lại do bấm nhầm backdrop/Huỷ, chỉ mất khi lưu thành công lên server.
  const [confirmedEditDeadline, setConfirmedEditDeadline] = useState(null);   { sessionId, value }

    Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

    Publish modal
  const [publishTarget, setPublishTarget] = useState(null);
  const [publishDeadline, setPublishDeadline] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmedPublishDeadline, setConfirmedPublishDeadline] = useState(null);   { sessionId, value }
    "now" = giao ngay (hành vi cũ) | "schedule" = hẹn giờ tự động giao (mục 5)
  const [publishMode, setPublishMode] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [confirmedScheduledAt, setConfirmedScheduledAt] = useState(null);   { sessionId, value }
  const [scheduleError, setScheduleError] = useState("");

    Sửa nội dung bài tập (flashcards/match_up/fill_in_blanks/mcqs) — mục 7
  const [editContentSessionId, setEditContentSessionId] = useState(null);

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
      Nếu có deadline đã "chốt" trước đó cho đúng session này (do lỡ đóng modal
      mà chưa lưu), khôi phục lại thay vì lấy giá trị gốc từ server.
    if (confirmedEditDeadline && confirmedEditDeadline.sessionId === s.id) {
      setEditDeadline(confirmedEditDeadline.value);
    } else {
      setEditDeadline(toLocalDatetimeValue(s.deadline));
    }
    setEditError("");
  };

  const handleConfirmEditDeadline = () => {
    if (!editTarget) return;
    setConfirmedEditDeadline({ sessionId: editTarget.id, value: editDeadline });
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
      setConfirmedEditDeadline(null);
    } catch (err) {
      setEditError(err.message || "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  const openPublish = (s) => {
    setPublishTarget(s);
    setPublishMode("now");
    setScheduledAt("");
    setScheduleError("");
    if (confirmedPublishDeadline && confirmedPublishDeadline.sessionId === s.id) {
      setPublishDeadline(confirmedPublishDeadline.value);
    } else {
      setPublishDeadline("");
    }
  };

  const handleConfirmPublishDeadline = () => {
    if (!publishTarget) return;
    setConfirmedPublishDeadline({ sessionId: publishTarget.id, value: publishDeadline });
  };

  const handleConfirmScheduledAt = () => {
    if (!publishTarget) return;
    setConfirmedScheduledAt({ sessionId: publishTarget.id, value: scheduledAt });
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    setScheduleError("");

    if (publishMode === "schedule") {
      if (!scheduledAt) {
        setScheduleError("Vui lòng chọn ngày giờ hẹn giao bài.");
        return;
      }
      if (new Date(scheduledAt).getTime() <= Date.now()) {
        setScheduleError("Thời điểm hẹn phải ở tương lai. Nếu muốn giao ngay, chọn \"Giao ngay\".");
        return;
      }
      setIsPublishing(true);
      try {
        const deadlineISO = publishDeadline ? new Date(publishDeadline).toISOString() : null;
        await scheduleSessionPublish(publishTarget.id, new Date(scheduledAt).toISOString(), deadlineISO);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === publishTarget.id
              ? { ...s, status: "SCHEDULED", scheduled_publish_at: new Date(scheduledAt).toISOString(), deadline: deadlineISO }
              : s
          )
        );
        setPublishTarget(null);
        setPublishDeadline("");
        setScheduledAt("");
        setConfirmedPublishDeadline(null);
        setConfirmedScheduledAt(null);
      } catch (err) {
        setScheduleError(err.message || "Hẹn giờ giao bài thất bại.");
      } finally {
        setIsPublishing(false);
      }
      return;
    }

      publishMode === "now"
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
      setConfirmedPublishDeadline(null);
    } catch (err) {
      setScheduleError(err.message || "Giao bài thất bại.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancelSchedule = async (s) => {
    try {
      await cancelScheduledPublish(s.id);
      setSessions((prev) =>
        prev.map((sess) =>
          sess.id === s.id ? { ...sess, status: "DRAFT", scheduled_publish_at: null } : sess
        )
      );
    } catch (err) {
      alert(err.message || "Huỷ lịch hẹn giờ thất bại.");
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
        <h2 className="text-lg font-bold text-slate-900 mb-1">Quản lý bài tập</h2>
        <p className="text-sm text-slate-900">Sửa tên, đặt hạn nộp, hoặc xoá bài tập theo khối lớp.</p>
      </div>

      {  Chọn lớp * 
      <div className="max-w-xs">
        <label className="text-sm font-semibold text-slate-900 block mb-1.5">Chọn khối lớp</label>
        <select
          className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate-900 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
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

      {  Danh sách session * 
      {isLoadingSessions && (
        <p className="text-sm text-slate-900">Đang tải danh sách bài tập...</p>
      )}

      {!isLoadingSessions && selectedClassId && sessions.length === 0 && (
        <p className="text-sm text-slate-900">Chưa có bài tập nào cho lớp này.</p>
      )}

      {sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((s) => (
            <CardContainer key={s.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-900 truncate">{s.title}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.status === "PUBLISHED"
                        ? "bg-success-bg text-success-text"
                        : s.status === "SCHEDULED"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-warning-bg text-warning-text"
                    }`}
                  >
                    {s.status === "PUBLISHED"
                      ? "Đã giao"
                      : s.status === "SCHEDULED"
                      ? `🕐 Hẹn giờ · ${new Date(s.scheduled_publish_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                      : "Nháp"}
                  </span>
                </div>
                <p className="text-xs text-slate-900 mt-0.5">
                  Hạn nộp: {formatDeadline(s.deadline)}
                  {s.published_at && (
                    <> · Giao: {new Date(s.published_at).toLocaleDateString("vi-VN")}< 
                  )}
                </p>
              </div>

              <div className="flex gap-2 shrink-0 flex-wrap">
                {(s.status === "DRAFT" || s.status === "SCHEDULED") && (
                  <Button variant="primary" size="sm" onClick={() => openPublish(s)}>
                    {s.status === "SCHEDULED" ? "⏰ Đổi lịch" : "Giao bài ▶"}
                  </Button>
                )}
                {s.status === "SCHEDULED" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-text hover:bg-danger-bg"
                    onClick={() => handleCancelSchedule(s)}
                  >
                    Huỷ lịch
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
                  Sửa
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditContentSessionId(s.id)}
                >
                  📝 Sửa nội dung
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

      {  Modal sửa * 
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Sửa bài tập"
        closeOnBackdrop={false}
      >
        <div className="space-y-4">
          <InputField
            label="Tên chủ đề"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            error={editError}
           
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-900 >Hạn nộp bài (tuỳ chọn)</label>
            <input
              type="datetime-local"
              className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate-900 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
             
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="text-xs font-semibold text-pink-600 hover:underline"
                onClick={handleConfirmEditDeadline}
              >
                ✓ Xác nhận deadline
              </button>
              {editDeadline && (
                <button
                  type="button"
                  className="text-xs text-slate-900 hover:text-danger-text text-left"
                  onClick={() => setEditDeadline("")}
                >
                  ✕ Xoá deadline (không giới hạn)
                </button>
              )}
            </div>
            {confirmedEditDeadline &&
              confirmedEditDeadline.sessionId === editTarget?.id &&
              confirmedEditDeadline.value === editDeadline && (
                <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-success-text bg-success-bg rounded-full px-3 py-1">
                  Đã chọn: {formatLocalDatetimeValue(confirmedEditDeadline.value)} ✓
                </span>
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

      {  Modal xác nhận giao bài * 
      <Modal
        isOpen={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        title="Giao bài tập"
        closeOnBackdrop={false}
      >
        <p className="text-sm text-slate-900 mb-4">
          Giao bài <strong>"{publishTarget?.title}"</strong> cho học sinh?
        </p>

        {  Mode tabs: giao ngay  hẹn giờ * 
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setPublishMode("now"); setScheduleError(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              publishMode === "now"
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white text-slate-900 border-surface-border hover:border-pink-300"
            }`}
          >
            🚀 Giao ngay
          </button>
          <button
            type="button"
            onClick={() => { setPublishMode("schedule"); setScheduleError(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              publishMode === "schedule"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-slate-900 border-surface-border hover:border-blue-300"
            }`}
          >
            🕐 Hẹn giờ giao
          </button>
        </div>

        {  Hẹn giờ: chọn ngày giờ sẽ tự động giao bài * 
        {publishMode === "schedule" && (
          <div className="flex flex-col gap-1.5 mb-4 p-3 bg-blue-50 rounded-2xl">
            <label className="text-sm font-semibold text-slate-900 >Thời điểm tự động giao bài</label>
            <input
              type="datetime-local"
              className="w-full h-11 rounded-2xl bg-white border border-blue-200 px-4 text-slate-900 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              value={scheduledAt}
              onChange={(e) => { setScheduledAt(e.target.value); setScheduleError(""); }}
             
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:underline"
                onClick={handleConfirmScheduledAt}
              >
                ✓ Xác nhận giờ hẹn
              </button>
            </div>
            {confirmedScheduledAt &&
              confirmedScheduledAt.sessionId === publishTarget?.id &&
              confirmedScheduledAt.value === scheduledAt && (
                <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-3 py-1">
                  Sẽ giao lúc: {formatLocalDatetimeValue(confirmedScheduledAt.value)} ✓
                </span>
              )}
            <p className="text-xs text-slate-900">Hệ thống sẽ tự động giao bài đúng vào thời điểm này.</p>
          </div>
        )}

        {  Hạn nộp bài (chung cho cả 2 chế độ) * 
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-sm font-semibold text-slate-900 >Hạn nộp bài (tuỳ chọn)</label>
          <input
            type="datetime-local"
            className="w-full h-11 rounded-2xl bg-white border border-surface-border px-4 text-slate-900 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
            value={publishDeadline}
            onChange={(e) => setPublishDeadline(e.target.value)}
           
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="text-xs font-semibold text-pink-600 hover:underline"
              onClick={handleConfirmPublishDeadline}
            >
              ✓ Xác nhận deadline
            </button>
            {publishDeadline && (
              <button
                type="button"
                className="text-xs text-slate-900 text-left hover:text-danger-text"
                onClick={() => setPublishDeadline("")}
              >
                ✕ Xoá deadline
              </button>
            )}
          </div>
          {confirmedPublishDeadline &&
            confirmedPublishDeadline.sessionId === publishTarget?.id &&
            confirmedPublishDeadline.value === publishDeadline && (
              <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-success-text bg-success-bg rounded-full px-3 py-1">
                Đã chọn: {formatLocalDatetimeValue(confirmedPublishDeadline.value)} ✓
              </span>
            )}
        </div>

        {scheduleError && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2 mb-3">
            {scheduleError}
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setPublishTarget(null)}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            fullWidth
            isLoading={isPublishing}
            onClick={handlePublish}
          >
            {publishMode === "schedule" ? "🕐 Đặt lịch hẹn giờ" : "🚀 Xác nhận giao bài"}
          </Button>
        </div>
      </Modal>

      {  Modal xác nhận xoá * 
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xoá bài tập"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-slate-900 mb-6">
          Bạn chắc chắn muốn xoá bài tập{" "}
          <span className="font-bold text-slate-900 >"{deleteTarget?.title}"</span>? Hành động này sẽ xoá
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

      {editContentSessionId && (
        <EditSessionExercisesPanel
          sessionId={editContentSessionId}
          onClose={() => setEditContentSessionId(null)}
         
      )}
    </div>
  );
}
