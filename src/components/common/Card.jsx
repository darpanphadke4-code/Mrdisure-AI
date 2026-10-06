// src/components/common/Card.jsx
import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-borderGray shadow-subtle ${
        hover ? 'transition-all duration-200 hover:shadow-card hover:border-sage-300' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-borderGray/60 mb-5 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-charcoal-800">{title}</h3>
        {subtitle && <p className="text-xs text-charcoal-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
