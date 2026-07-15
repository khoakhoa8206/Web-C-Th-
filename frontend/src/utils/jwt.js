/**
 * Tiện ích JWT phía client — CHỈ dùng để đọc payload, không xác thực chữ ký.
 * Việc xác thực thật sự phải do backend đảm nhiệm; token ở client chỉ nên
 * dùng cho mục đích hiển thị UI (ví dụ: khoá/mở khối lớp).
 */

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const withPad = pad ? padded + "=".repeat(4 - pad) : padded;
  return decodeURIComponent(
    atob(withPad)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function decodeJwt(token) {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload));
  } catch (err) {
    console.error("Không thể giải mã token:", err);
    return null;
  }
}

export function isTokenExpired(payload) {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Tạo token giả lập DẠNG JWT (header.payload.signature) hoàn toàn ở client,
 * chỉ dùng cho môi trường demo/dev khi chưa nối backend thật.
 * KHÔNG dùng hàm này trong production — token thật phải do server ký (HMAC/RSA).
 */
