// src/components/policies/PolicyCoverageTab.jsx
import React from 'react';
import { Badge } from '../common/Badge';
import { Check, ShieldCheck, Info } from 'lucide-react';

export const PolicyCoverageTab = ({ policy }) => {
  const coverageList = policy.coverageDetails || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-borderGray">
        <h4 className="text-sm font-bold text-forest-900 font-heading">
          Covered Benefits & In-Hospital Limits
        </h4>
        <span className="text-xs text-charcoal-400">
          {coverageList.length} Extracted Benefits
        </span>
      </div>

      <div className="divide-y divide-borderGray/60 border border-borderGray rounded-2xl overflow-hidden bg-white">
        {coverageList.map((item, index) => (
          <div key={index} className="p-4 hover:bg-forest-50/40 transition-colors flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-charcoal-900">{item.category}</h5>
                <p className="text-xs text-charcoal-500 mt-0.5">{item.notes}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-forest-900 block font-mono">
                {item.limit}
              </span>
              <Badge variant={item.status} size="xs" className="mt-1">
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 bg-warmWhite rounded-xl border border-borderGray text-xs text-charcoal-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <span>
          Pre-hospitalization bills (60 days) and post-hospitalization bills (90 days) must be directly related to the treated medical condition to qualify for cashless or reimbursement settlement.
        </span>
      </div>
    </div>
  );
};
