import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone?: "white" | "tinted";
  hoverable?: boolean;
  padded?: boolean;
  as?: ElementType;
}

export function CardContainer({
  children,
  tone = "white",
  hoverable = false,
  padded = true,
  className,
  as: Component = "div",
  ...rest
}: CardContainerProps) {
  const toneStyles = tone === "tinted" ? "bg-pink-50" : "bg-white";
  return (
    <Component
      className={cn(
        "rounded-2xl shadow-sm border border-surface-border/60",
        toneStyles,
        padded && "p-5",
        hoverable
          ? "transition-all duration-300 ease-out hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"
          : "transition-shadow duration-300 ease-out",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}