import {
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  icon?: ReactNode;
  containerClassName?: string;
}

export function InputField({
  label,
  error,
  helperText,
  icon = null,
  className,
  containerClassName,
  id,
  ...rest
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate">
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
          className={cn(
            "w-full h-11 rounded-2xl bg-white text-slate placeholder:text-slate/40",
            "border transition-all duration-200 ease-out outline-none",
            icon ? "pl-11 pr-4" : "px-4",
            error
              ? "border-danger bg-danger-bg/40 focus:ring-2 focus:ring-danger/30"
              : "border-surface-border focus:border-pink-400 focus:ring-2 focus:ring-pink-200",
            shake && "animate-shake-error",
            className,
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs font-medium text-danger-text"
        >
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-xs text-slate/60">{helperText}</p>
        )
      )}
    </div>
  );
}