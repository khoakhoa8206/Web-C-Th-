/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          light: '#FFF0F2',
          soft: '#FFD3DA',
          medium: '#FF8597',
          dark: '#D9465D',
        },
        success: {
          bg: '#E8F5E9',
          text: '#2E7D32',
          DEFAULT: '#4CAF50',
        },
        danger: {
          bg: '#FFEBEE',
          text: '#C62828',
          DEFAULT: '#F44336',
        },
        warning: {
          bg: '#FFFDE7',
          text: '#8A6D00',
          DEFAULT: '#FBC02D',
        },
        slate: {
          50: '#F8F9FA',
          100: '#F0F1F3',
          200: '#E2E5E9',
          300: '#D4D8DE',
          400: '#8B96A0',
          500: '#5F6F7F',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },

      backgroundColor: {
        'surface-soft': '#F8F9FA',
        'surface-border': '#E9ECEF',
        'success-bg': '#E8F5E9',
        'danger-bg': '#FFEBEE',
        'warning-bg': '#FFFDE7',
      },

      borderColor: {
        'surface-border': '#E9ECEF',
      },

      textColor: {
        'success-text': '#2E7D32',
        'danger-text': '#C62828',
        'warning-text': '#8A6D00',
      },

      boxShadow: {
        // Layered shadows
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(217, 70, 93, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'card-hover': '0 1px 3px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(217, 70, 93, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'card-elevated': '0 4px 6px rgba(0, 0, 0, 0.1), 0 20px 40px -5px rgba(217, 70, 93, 0.15)',
        'button': '0 2px 6px rgba(255, 133, 151, 0.35)',
        'button-hover': '0 6px 12px rgba(255, 133, 151, 0.45)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      },

      borderRadius: {
        'pill': '9999px',
      },

      transitionDuration: {
        'fast': '150ms',
        'base': '300ms',
        'slow': '500ms',
      },

      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },

      animation: {
        // Entrance animations
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        
        // Micro-interactions
        'pop-in': 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'bounce-slight': 'bounceSlightly 1s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // Drag animations
        'drag-glow': 'dragGlow 1.5s ease-in-out infinite',
        
        // Existing animations (keep for compatibility)
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      keyframes: {
        // Entrance keyframes
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },

        // Micro-interactions
        popIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounceSlightly: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },

        // Drag animation
        dragGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 133, 151, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255, 133, 151, 0)' },
        },

        // Keep existing keyframes for compatibility
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
        },
      },

      backgroundImage: {
        'gradient-pink-coral': 'linear-gradient(135deg, #FF8597 0%, #FF6B7A 100%)',
        'gradient-pink-coral-hover': 'linear-gradient(135deg, #FF9AA6 0%, #FF7B8A 100%)',
        'gradient-success-teal': 'linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%)',
        'gradient-danger-red': 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
        'gradient-card-bg': 'linear-gradient(135deg, #FFF7F9 0%, #FFFAFB 100%)',
      },

      willChange: {
        'transform': 'transform',
        'opacity': 'opacity',
        'auto': 'auto',
      },
    },
  },

  plugins: [
    // Custom plugin: Gradient utilities
    function ({ addUtilities, theme }) {
      const gradients = {
        '.bg-gradient-primary': {
          '@apply bg-gradient-to-r from-pink-600 to-pink-500': {},
        },
        '.bg-gradient-primary-hover': {
          '@apply bg-gradient-to-r from-pink-700 to-pink-600': {},
        },
        '.bg-gradient-success': {
          '@apply bg-gradient-to-r from-green-500 to-teal-500': {},
        },
        '.text-gradient-primary': {
          background: 'linear-gradient(135deg, #FF8597 0%, #FF6B7A 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      };
      addUtilities(gradients);
    },

    // Custom plugin: Glass morphism
    function ({ addUtilities }) {
      const glassmorphism = {
        '.glass': {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          '@apply border rounded-2xl': {},
        },
        '.glass-dark': {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          '@apply border rounded-2xl': {},
        },
      };
      addUtilities(glassmorphism);
    },

    // Custom plugin: Smooth transitions
    function ({ addUtilities }) {
      const transitions = {
        '.transition-smooth': {
          '@apply transition-all duration-300 ease-out': {},
        },
        '.transition-fast': {
          '@apply transition-all duration-150 ease-out': {},
        },
        '.transition-slow': {
          '@apply transition-all duration-500 ease-out': {},
        },
      };
      addUtilities(transitions);
    },
  ],
}
