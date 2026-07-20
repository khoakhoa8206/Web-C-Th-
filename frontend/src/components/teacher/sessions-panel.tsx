import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeStatus,
  Button,
  CardContainer,
  Modal,
} from "@/components/vocab-ui";
import { ClassPicker } from "./class-picker";
import {
  deleteSession,
  fetchClasses,
  fetchSessionsForClass,
  publishSession,
  type SessionRow,
} from "@/lib/teacher-api";

function statusLabel(s: SessionRow) {
  if (s.status === "PUBLISHED")
    return <BadgeStatus status="completed" />;
  if (s.status === "SCHEDULED")
    return <BadgeStatus status="in-progress" />;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-surface-soft text-slate/60">
      <span className="h-1.5 w-1.5 rounded-full bg-slate/40" />
      NHÁP
    </span>
  );
}

export function SessionsPanel() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const [toDelete, setToDelete] = useState<SessionRow | null>(null);

  const classesQ = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  useEffect(() => {
    if (!classId && classesQ.data?.[0]) setClassId(classesQ.data[0].id);
  }, [classesQ.data, classId]);

  const sessionsQ = useQuery({
    queryKey: ["sessions", classId],
    queryFn: () => fetchSessionsForClass(classId),
    enabled: !!classId,
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishSession(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["sessions", classId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", classId] });
      setToDelete(null);
    },
  });

  const sessions = sessionsQ.data || [];

  return (
    <div>
      <h2 className="font-bold text-slate text-lg">Quản lý bài tập</h2>
      <p className="text-sm text-slate/50 mb-4">
        Xuất bản bản nháp để học sinh có thể luyện tập.
      </p>

      <div className="mb-4 max-w-xs">
        <ClassPicker
          classes={classesQ.data || []}
          value={classId}
          onChange={setClassId}
        />
      </div>

      {sessions.length === 0 ? (
        <CardContainer className="text-center py-10">
          <p className="text-sm text-slate/40">
            {sessionsQ.isLoading
              ? "Đang tải..."
              : 'Chưa có bài tập nào. Tạo bài mới trong tab "AI Generator".'}
          </p>
        </CardContainer>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <CardContainer key={s.id} className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="font-bold text-slate">{s.title}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate/50">
                  {statusLabel(s)}
                  {s.published_at && (
                    <span>
                      • Xuất bản:{" "}
                      {new Date(s.published_at).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {s.status !== "PUBLISHED" && (
                  <Button
                    size="sm"
                    variant="success"
                    isLoading={publish.isPending && publish.variables === s.id}
                    onClick={() => publish.mutate(s.id)}
                  >
                    Xuất bản
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setToDelete(s)}
                >
                  Xoá
                </Button>
              </div>
            </CardContainer>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Xoá bài tập"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate">
            Xác nhận xoá <strong>{toDelete?.title}</strong>? Tất cả bài nộp
            liên quan sẽ bị xoá theo.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setToDelete(null)}>
              Huỷ
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={remove.isPending}
              onClick={() => toDelete && remove.mutate(toDelete.id)}
            >
              Xoá
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}