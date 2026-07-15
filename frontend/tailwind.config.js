/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Pink scale
        pink: {
          50: "#FFF0F2",   // Light Pink - nền trang, nền card nhẹ
          100: "#FFE3E7",
          200: "#FFD3DA",  // Soft Pink - hover, border, highlight
          300: "#FFB6C1",
          400: "#FF8597",  // Medium Pink - nút chính, active
          500: "#F2617A",
          600: "#D9465D",  // Dark Pink - text tiêu đề, icon quan trọng
          700: "#B5344A",
          800: "#8F2839",
          900: "#6B1D2A",
        },
        // Trạng thái
        success: {
          bg: "#E8F5E9",
          DEFAULT: "#4CAF50",
          text: "#2E7D32",
        },
        danger: {
          bg: "#FFEBEE",
          DEFAULT: "#F44336",
          text: "#C62828",
        },
        warning: {
          bg: "#FFFDE7",
          DEFAULT: "#FBC02D",   // vàng đậm hơn 1 chút để đạt tương phản text đủ đọc
          text: "#8A6D00",
        },
        // Trung tính
        slate: {
          DEFAULT: "#2C3E50", // Dark Slate - text chính
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F8F9FA",    // Cool Gray - nền phụ
          border: "#E9ECEF",  // Cool Gray - border phụ
        },
      },
      fontFamily: {
        sans: ["'Nunito'", "'Quicksand'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        sm: "0 2px 8px 0 rgba(217, 70, 93, 0.06)",
        card: "0 4px 16px 0 rgba(217, 70, 93, 0.08)",
        "card-hover": "0 8px 24px 0 rgba(217, 70, 93, 0.14)",
        button: "0 2px 6px 0 rgba(255, 133, 151, 0.35)",
      },
      keyframes: {
        // Lật thẻ flashcard (3D flip)
        flipCard: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        // Hiệu ứng click nút (bấm lún nhẹ rồi nảy về)
        buttonPress: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" },
        },
        // Hiệu ứng hoàn thành bài tập (bật lên + rung nhẹ ăn mừng)
        completePop: {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "80%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Rung nhẹ báo lỗi
        shakeError: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        // Fill progress bar mượt
        progressGrow: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-value, 0%)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flip-card": "flipCard 0.6s cubic-bezier(0.4, 0.2, 0.2, 1) forwards",
        "button-press": "buttonPress 0.25s ease-in-out",
        "complete-pop": "completePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "shake-error": "shakeError 0.4s ease-in-out",
        "progress-grow": "progressGrow 0.3s ease-out forwards",
        "fade-in-up": "fadeInUp 0.3s ease-out forwards",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
