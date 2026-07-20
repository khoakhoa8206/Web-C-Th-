import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnBackdrop) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, closeOnBackdrop]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate/40 backdrop-blur-sm p-4 animate-fade-in-up"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={cn(
          "w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-card-hover",
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-surface-border rounded-t-3xl z-10">
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