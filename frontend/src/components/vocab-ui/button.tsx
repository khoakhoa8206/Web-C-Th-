import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-pink-400 text-white hover:bg-pink-500 active:bg-pink-600 shadow-button",
  secondary:
    "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 active:bg-pink-200",
  danger:
    "bg-danger text-white hover:brightness-95 active:brightness-90 shadow-button",
  success:
    "bg-success text-white hover:brightness-95 active:brightness-90 shadow-button",
  ghost: "bg-transparent text-slate hover:bg-pink-50 active:bg-pink-100",
};

const SIZE: Record<Size, string> = {
  sm: "h-10 px-4 text-sm min-w-[44px]",
  md: "h-11 px-5 text-base min-w-[44px]",
  lg: "h-12 px-6 text-lg min-w-[44px]",
};

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  icon = null,
  fullWidth = false,
  className,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={(e) => {
        if (disabled || isLoading) return;
        setPressed(true);
        setTimeout(() => setPressed(false), 250);
        onClick?.(e);
      }}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold select-none",
        "transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.96]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        pressed && "animate-button-press",
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin"
          aria-hidden="true"
        />
      ) : (
        icon && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children != null && <span>{children}</span>}
    </button>
  );
}