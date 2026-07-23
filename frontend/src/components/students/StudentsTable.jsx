import React from "react";
import { CardContainer } from "../ui";
function classLabel(classId, classes) {
  return classes.find((klass) => klass.id === classId)?.name ?? classId;
}

export default function StudentsTable({ students, classes = [], isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <CardContainer className="text-center py-10">
        <p className="text-sm text-slate-900">Đang tải danh sách học sinh...</p>
      </CardContainer>
    );
  }

  if (students.length === 0) {
    return (
      <CardContainer className="text-center py-10">
        <p className="text-sm text-slate-900">Chưa có học sinh nào. Bấm "Thêm học sinh" để bắt đầu.</p>
      </CardContainer>
    );
  }

  return (
    <CardContainer padded={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-soft text-left text-xs font-bold text-slate-900 uppercase tracking-wide">
              <th className="px-4 py-3">Họ và Tên</th>
              <th className="px-4 py-3">Khối lớp</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-surface-border last:border-0">
                <td className="px-4 py-3 font-semibold text-slate">{s.full_name}</td>
                <td className="px-4 py-3">
                  <span className="inline-block bg-pink-50 text-pink-600 text-xs font-bold rounded-full px-3 py-1">
                    {classLabel(s.class_id, classes)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit(s)}
                      className="text-xs font-semibold text-pink-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="text-xs font-semibold text-danger-text hover:underline"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContainer>
  );
}
