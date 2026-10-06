// src/components/policies/PolicyOverviewTab.jsx
import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Shield, Calendar, Users, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const PolicyOverviewTab = ({ policy }) => {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-forest-50 p-5 rounded-2xl border border-forest-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700">
            {policy.provider}
          </span>
          <h3 className="text-lg font-bold text-forest-900 font-heading">
            {policy.name}
          </h3>
          <p className="text-xs text-charcoal-500 font-mono mt-0.5">
            Policy No: {policy.policyNumber}
          </p>
        </div>
        <div className="flex sm:flex-col items-end gap-2">
          <Badge variant={policy.status} dot size="sm">
            {policy.status}
          </Badge>
          <Badge variant={policy.analysisStatus} size="sm">
            {policy.analysisStatus}
          </Badge>
        </div>
      </div>

      {/* Grid of Key Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-borderGray">
          <span className="text-charcoal-400 block text-[11px] font-medium">Base Sum Insured</span>
          <span className="font-bold text-forest-900 text-base mt-0.5 block">
            {formatCurrency(policy.sumInsured)}
          </span>
          <span className="text-[10px] text-charcoal-400">Annual aggregate pool</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-borderGray">
          <span className="text-charcoal-400 block text-[11px] font-medium">Policy Period</span>
          <span className="font-bold text-charcoal-800 text-xs mt-0.5 block">
            {formatDate(policy.effectiveDate)} - {formatDate(policy.renewalDate)}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Active Coverage</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-borderGray">
          <span className="text-charcoal-400 block text-[11px] font-medium">Policy Type</span>
          <span className="font-bold text-charcoal-800 text-xs mt-0.5 block">
            {policy.type}
          </span>
          <span className="text-[10px] text-charcoal-400">Indemnity Health Plan</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-borderGray">
          <span className="text-charcoal-400 block text-[11px] font-medium">Room Category Allowed</span>
          <span className="font-bold text-charcoal-800 text-xs mt-0.5 block">
            {policy.roomCategoryAllowed}
          </span>
          <span className="text-[10px] text-amber-700">Check proportionate rule</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-borderGray">
          <span className="text-charcoal-400 block text-[11px] font-medium">Annual Deductible</span>
          <span className="font-bold text-charcoal-800 text-xs mt-0.5 block">
            {formatCurrency(policy.deductible)}
          </span>
          <span className="text-[10px] text-charcoal-400">Applied per policy year</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-borderGray">
          <span className="text-charcoal-400 block text-[11px] font-medium">Co-Payment Requirement</span>
          <span className="font-bold text-charcoal-800 text-xs mt-0.5 block">
            {policy.copayPercent}%
          </span>
          <span className="text-[10px] text-charcoal-400">On eligible admissible bill</span>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong>Extracted Clause Confidence:</strong> 94% of core provisions match standard IRDAI guidelines. Click the <em>Key Clauses</em> tab to cross-verify against the original document text.
        </div>
      </div>
    </div>
  );
};
