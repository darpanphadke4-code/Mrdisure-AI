// src/components/policies/PolicyLimitsTab.jsx
import React from 'react';
import { Badge } from '../common/Badge';
import { AlertCircle, CheckCircle2, Sliders } from 'lucide-react';

export const PolicyLimitsTab = ({ policy }) => {
  const limits = policy.limitsAndConditions || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-borderGray">
        <h4 className="text-sm font-bold text-forest-900 font-heading">
          Financial Limits, Deductibles & Co-Payments
        </h4>
        <span className="text-xs text-charcoal-400">
          {limits.length} Conditions Identified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {limits.map((limit, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border border-borderGray hover:border-forest-200 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-charcoal-800 font-heading">
                  {limit.name}
                </span>
                {limit.verified ? (
                  <Badge variant="verified" size="xs">
                    Verified
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Unverified
                  </span>
                )}
              </div>
              <div className="text-lg font-bold text-forest-900 font-mono mb-1">
                {limit.value}
              </div>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                {limit.description}
              </p>
            </div>
            {!limit.verified && (
              <p className="mt-3 pt-2 border-t border-borderGray text-[10px] text-amber-700 italic">
                *Requires user confirmation during bill calculation.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
