import React, { useState } from "react";

/**
 * Button — nút bấm nguyên tử của Design System Pastel Pink.
 *
 * Variants: primary | secondary | danger | success | ghost
 * Sizes:    sm | md | lg  (mặc định md, luôn >= 44x44px trên mobile)
 *
 * Usage:
 *   <Button variant="primary" onClick={...}>Lưu từ vựng</Button>
 *   <Button variant="danger" size="sm" isLoading>Xoá</Button>
 */

const VARIANT_STYLES = {
  primary:
    "bg-pink-400 text-white hover:bg-pink-500 active:bg-pink-600 shadow-button",
  secondary:
    "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 active:bg-pink-200",
  danger:
    "bg-danger text-white hover:bg-danger-text active:bg-danger-text shadow-button",
  success:
    "bg-success text-white hover:brightness-95 active:brightness-90 shadow-button",
  ghost:
    "bg-transparent text-slate hover:bg-pink-50 active:bg-pink-100",
};

const SIZE_STYLES = {
  sm: "h-10 px-4 text-sm min-w-[44px]",
  md: "h-11 px-5 text-base min-w-[44px]",
  lg: "h-12 px-6 text-lg min-w-[44px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  icon = null,
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...rest
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e) => {
    if (disabled || isLoading) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 250);
    onClick?.(e);
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-busy={isLoading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-2xl font-semibold select-none",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.03] active:scale-[0.96]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? "w-full" : "",
        isPressed ? "animate-button-press" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin"
          aria-hidden="true"
        />
      ) : (
        icon && <span className="shrink-0" aria-hidden="true">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
