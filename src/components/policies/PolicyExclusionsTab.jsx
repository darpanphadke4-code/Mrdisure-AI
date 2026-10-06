// src/components/policies/PolicyExclusionsTab.jsx
import React from 'react';
import { Badge } from '../common/Badge';
import { AlertOctagon, Clock, ShieldAlert } from 'lucide-react';

export const PolicyExclusionsTab = ({ policy }) => {
  const exclusions = policy.exclusions || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-borderGray">
        <h4 className="text-sm font-bold text-forest-900 font-heading">
          Policy Exclusions & Waiting Period Caps
        </h4>
        <span className="text-xs text-charcoal-400">
          {exclusions.length} Core Exclusions
        </span>
      </div>

      {/* Waiting Periods Banner */}
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-900 font-bold font-heading">
          <Clock className="w-4 h-4 text-amber-700" />
          <span>Extracted Policy Waiting Periods</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-charcoal-700">
          <div className="bg-white p-2.5 rounded-lg border border-amber-200">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Initial Waiting</span>
            <span className="font-bold text-forest-900">{policy.waitingPeriodInitial || '30 Days'}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-amber-200">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Specific Illnesses</span>
            <span className="font-bold text-forest-900">{policy.waitingPeriodSpecific || '24 Months'}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-amber-200">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Pre-Existing (PED)</span>
            <span className="font-bold text-forest-900">{policy.waitingPeriodPreExisting || '36 Months'}</span>
          </div>
        </div>
      </div>

      {/* Exclusions List */}
      <div className="space-y-3">
        {exclusions.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border border-borderGray hover:border-rose-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <h5 className="text-xs font-bold text-charcoal-900">{item.title}</h5>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-charcoal-400 font-mono">{item.clauseRef}</span>
                <Badge variant="excluded" size="xs">
                  {item.type}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-charcoal-500 pl-6 leading-relaxed">
              {item.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
