// src/components/common/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-forest-700 text-white hover:bg-forest-800 active:bg-forest-900 focus:ring-forest-500 shadow-sm",
    secondary: "bg-forest-100 text-forest-900 hover:bg-forest-200 active:bg-forest-300 focus:ring-forest-400 border border-forest-200",
    outline: "border border-sage-300 bg-white text-forest-700 hover:bg-forest-50 hover:border-forest-400 focus:ring-forest-400",
    ghost: "bg-transparent text-charcoal-600 hover:text-forest-800 hover:bg-forest-50 focus:ring-forest-300",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-400 shadow-sm",
    subtle: "bg-warmWhite text-charcoal-700 hover:bg-borderGray border border-borderGray",
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs gap-1.5",
    sm: "px-3.5 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4 py-2 text-sm font-semibold gap-2",
    lg: "px-5 py-2.5 text-base font-semibold gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 text-current shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 text-current shrink-0" />}
    </button>
  );
};
