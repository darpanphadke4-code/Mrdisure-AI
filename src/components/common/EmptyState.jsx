// src/components/common/EmptyState.jsx
import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-sage-300 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4 shadow-subtle">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-forest-900 font-heading mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-charcoal-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
