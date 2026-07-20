import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Bảng xếp hạng — VocabHub" },
      {
        name: "description",
        content: "Xem ai đang dẫn đầu trong việc luyện từ vựng mỗi ngày.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Bảng xếp hạng"
      title="Sắp ra mắt"
      description="Bảng xếp hạng với huy chương, sticky header và real-time cập nhật sẽ có trong Pha 2."
    />
  ),
});