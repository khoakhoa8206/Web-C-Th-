import React from "react";

/**
 * CardContainer — khối chứa nội dung bo góc lớn, bóng mờ nhẹ.
 *
 * Variants nền: white | tinted (hồng cực nhạt)
 * hoverable    — bật hiệu ứng nâng nhẹ khi hover (dùng cho card có thể click)
 *
 * Usage:
 *   <CardContainer tone="tinted" hoverable onClick={...}>
 *     <h3>Bài học 1: Chào hỏi</h3>
 *   </CardContainer>
 */
export default function CardContainer({
  children,
  tone = "white",
  hoverable = false,
  padded = true,
  className = "",
  as: Component = "div",
  ...rest
}) {
  const toneStyles = {
    white: "bg-white",
    tinted: "bg-pink-50",
  };

  return (
    <Component
      className={[
        "rounded-2xl shadow-sm border border-surface-border/60",
        toneStyles[tone],
        padded ? "p-5" : "",
        hoverable
          ? "transition-all duration-300 ease-out hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"
          : "transition-shadow duration-300 ease-out",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}
