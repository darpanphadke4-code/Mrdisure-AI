// src/components/common/Badge.jsx
import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export const Badge = ({
  children,
  variant,
  size = 'sm',
  dot = false,
  className = '',
}) => {
  let styleClass = 'bg-forest-100 text-forest-800 border-forest-200';
  let dotClass = 'bg-forest-600';

  if (variant) {
    const style = getStatusBadgeStyle(variant);
    styleClass = style.bg;
    dotClass = style.dot;
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] font-medium',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styleClass} ${sizes[size] || sizes.sm} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
      <span>{children}</span>
    </span>
  );
};
