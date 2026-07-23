import React, { useId, useState } from "react";

/**
 * InputField — ô nhập liệu mềm mại của Design System Pastel Pink.
 *
 * Props:
 *   label        — nhãn hiển thị phía trên input
 *   error        — chuỗi lỗi (nếu có) sẽ hiện viền + text đỏ nhạt
 *   helperText   — chú thích phụ khi không có lỗi
 *   icon         — icon hiển thị bên trái input (tuỳ chọn)
 *
 * Usage:
 *   <InputField
 *     label="Từ vựng"
 *     placeholder="Nhập từ tiếng Anh..."
 *     error={errors.word}
 *   />
 */
export default function InputField({
  label,
  error,
  helperText,
  icon = null,
  className = "",
  containerClassName = "",
  id,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [shake, setShake] = useState(false);

  // Rung nhẹ khi lỗi mới xuất hiện
  React.useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={[
            "w-full h-11 rounded-2xl bg-white text-slate placeholder:text-slate-600",
            "border transition-all duration-200 ease-out outline-none",
            icon ? "pl-11 pr-4" : "px-4",
            error
              ? "border-danger bg-danger-bg/40 focus:ring-2 focus:ring-danger/30"
              : "border-surface-border focus:border-pink-400 focus:ring-2 focus:ring-pink-200",
            shake ? "animate-shake-error" : "",
            className,
          ].join(" ")}
          {...rest}
        />
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-danger-text">
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-xs text-slate-700">{helperText}</p>
        )
      )}
    </div>
  );
}
