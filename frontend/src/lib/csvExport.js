import Papa from "papaparse";

/**
 * Xuất báo cáo điểm của lớp ra file CSV, tải trực tiếp về máy giáo viên.
 * rows: mảng object phẳng, ví dụ [{ "Họ và Tên": "...", "Điểm": 90, ... }]
 */
export function exportRowsToCsv(rows, filename = "bao-cao-lop-hoc.csv") {
  const csv = Papa.unparse(rows);
  // Thêm BOM để Excel mở tiếng Việt không bị lỗi font
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
