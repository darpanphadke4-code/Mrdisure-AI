// src/components/dashboard/StatCard.jsx
import React from 'react';
import { Card } from '../common/Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
}) => {
  return (
    <Card padding="p-5" className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-forest-900 mt-1 font-heading tracking-tight">
            {value}
          </div>
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-charcoal-500">
              {trend && (
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                    trendPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {trend}
                </span>
              )}
              <span>{subtitle}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0 group-hover:bg-forest-100 transition-colors">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Decorative subtle corner bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-forest-500/20 via-forest-500/40 to-forest-500/10" />
    </Card>
  );
};
