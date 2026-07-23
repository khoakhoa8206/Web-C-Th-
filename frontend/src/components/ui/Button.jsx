import React from "react";

 *
 * Button Component v2 — Enhanced with gradients, animations, states
 * 
 * Variants: primary, secondary, ghost, danger, success
 * Sizes: sm, md (default), lg
 * States: normal, hover, active, disabled, loading
 * 
 * Usage:
 * <Button variant="primary" size="md" disabled={false} loading={false}>
 *   Click me
 * </Button>
 */

const VARIANTS = {
  primary: {
    base: 'bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold shadow-button',
    hover: 'hover:shadow-button-hover hover:from-pink-700 hover:to-pink-600',
    active: 'active:scale-95',
  },
  secondary: {
    base: 'bg-gray-100 text-slate-900 border border-surface-border font-semibold',
    hover: 'hover:bg-pink-50 hover:border-pink-300 hover:shadow-sm',
    active: 'active:scale-95',
  },
  ghost: {
    base: 'bg-transparent text-pink-600 font-semibold',
    hover: 'hover:bg-pink-50 hover:text-pink-700',
    active: 'active:scale-95',
  },
  danger: {
    base: 'bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold shadow-button',
    hover: 'hover:shadow-button-hover hover:from-red-700 hover:to-red-600',
    active: 'active:scale-95',
  },
  success: {
    base: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold shadow-button',
    hover: 'hover:shadow-button-hover hover:from-green-700 hover:to-emerald-600',
    active: 'active:scale-95',
  },
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-3 text-sm rounded-2xl',
  lg: 'px-6 py-4 text-base rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className,
  ...props
}) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = SIZES[size] || SIZES.md;

  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-400',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
    variantStyle.base,
    variantStyle.hover,
    variantStyle.active,
    sizeStyle,
    fullWidth && 'w-full',
    loading && 'opacity-75 cursor-wait',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="inline-block animate-spin">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" stroke="currentColor" opacity="0.3"  
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
             
          </svg>
        </span>
      )}
      {children}
    </button>
  );
}

 *
 * Button Group Component — For multiple related buttons
 * Usage:
 * <ButtonGroup>
 *   <Button>Cancel</Button>
 *   <Button variant="primary">Submit</Button>
 * </ButtonGroup>
 */
export function ButtonGroup({ children, gap = 3 }) {
  const gapClass = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
  }[gap] || 'gap-3';

  return (
    <div className={`flex flex-col sm:flex-row ${gapClass}`}>
      {children}
    </div>
  );
}

 *
 * Icon Button Component — For icon-only buttons
 * Usage:
 * <IconButton icon="×" onClick={() => onClose()}  
 */
export function IconButton({
  icon,
  label,
  onClick,
  variant = 'ghost',
  size = 'sm',
  ...props
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center',
        'rounded-lg transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400',
        'hover:bg-pink-50 active:scale-95',
      ].join(' ')}
      {...props}
    >
      {icon}
    </button>
  );
}
