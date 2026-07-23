import React from "react";
import StudentRow from "./StudentRow";
import { CardContainer } from "../ui";

/**
 * StudentTable — bảng danh sách học sinh của buổi học đang chọn.
 * Cột: Họ và Tên, Trạng thái, Số lần làm lại, Thời gian làm bài, Chi tiết.
 */
export default function StudentTable({ students, attemptsByStudent, isLoading, onClickName }) {
  if (isLoading) {
    return (
      <CardContainer className="text-center py-10">
        <p className="text-sm text-slate-900">Đang tải dữ liệu học sinh...</p>
      </CardContainer>
    );
  }

  if (students.length === 0) {
    return (
      <CardContainer className="text-center py-10">
        <p className="text-sm text-slate-900">Chưa có học sinh nào trong khối lớp này.</p>
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
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-center">Lần làm lại</th>
              <th className="px-4 py-3 text-center">Thời gian</th>
              <th className="px-4 py-3 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                attemptInfo={attemptsByStudent[student.id]}
                onClickName={onClickName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </CardContainer>
  );
}
