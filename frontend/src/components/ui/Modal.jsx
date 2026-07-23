import React, { useEffect } from "react";

/**
 * Modal — hộp thoại nền mờ dùng chung (lịch sử học sinh, form CRUD...).
 * Đóng bằng nút X, click ra ngoài, hoặc phím Esc.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape" && closeOnBackdrop) onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, closeOnBackdrop]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate/40 backdrop-blur-sm p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-card-hover`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-surface-border rounded-t-3xl">
          <h2 className="font-bold text-slate text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate/40 hover:bg-pink-50 hover:text-pink-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
