// src/components/chat/PolicyContextPanel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Calculator, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export const PolicyContextPanel = ({ policy, onSelectPolicy }) => {
  const navigate = useNavigate();

  if (!policy) return null;

  return (
    <div className="w-72 bg-white border-l border-borderGray flex flex-col h-full shrink-0 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 pb-3 border-b border-borderGray">
        <Shield className="w-4 h-4 text-forest-700" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 font-heading">
          Active Context Policy
        </h4>
      </div>

      {/* Policy Card in context */}
      <div className="mt-4 p-3.5 bg-forest-50/70 border border-forest-100 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-forest-700">
            {policy.provider}
          </span>
          <Badge variant={policy.status} dot size="xs">
            {policy.status}
          </Badge>
        </div>
        <h5 className="text-xs font-bold text-charcoal-900 font-heading line-clamp-2">
          {policy.name}
        </h5>
        <div className="text-[11px] text-charcoal-400 font-mono">
          {policy.policyNumber}
        </div>
      </div>

      {/* Extracted Condition Ledger */}
      <div className="mt-4 space-y-2.5 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block">
          Policy Parameters
        </span>

        <div className="flex justify-between py-1.5 border-b border-borderGray/60">
          <span className="text-charcoal-500">Sum Insured:</span>
          <span className="font-bold text-forest-900">{formatCurrency(policy.sumInsured)}</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-borderGray/60">
          <span className="text-charcoal-500">Deductible:</span>
          <span className="font-bold text-charcoal-800">{formatCurrency(policy.deductible)}</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-borderGray/60">
          <span className="text-charcoal-500">Co-Payment:</span>
          <span className="font-bold text-charcoal-800">{policy.copayPercent}%</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-borderGray/60">
          <span className="text-charcoal-500">Room Rent Cap:</span>
          <span className="font-semibold text-charcoal-800">
            {policy.roomRentLimitPerDay > 0 ? `₹${policy.roomRentLimitPerDay}/day` : 'Single Private'}
          </span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-borderGray/60">
          <span className="text-charcoal-500">ICU Limit:</span>
          <span className="font-semibold text-emerald-700">Covered at actuals</span>
        </div>

        <div className="flex justify-between py-1.5 border-b border-borderGray/60">
          <span className="text-charcoal-500">Consumables Rider:</span>
          <span className="font-semibold text-charcoal-800">
            {policy.hasConsumablesRider ? 'Active (90% cover)' : 'Not Active'}
          </span>
        </div>
      </div>

      {/* Cost Estimator Direct Bridge */}
      <div className="mt-6 pt-4 border-t border-borderGray">
        <div className="p-3 bg-warmWhite rounded-xl border border-borderGray mb-3">
          <p className="text-[11px] text-charcoal-600 leading-snug">
            Need an itemized breakdown of a surgical or hospital bill?
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full text-xs"
          leftIcon={Calculator}
          rightIcon={ArrowRight}
          onClick={() => navigate('/app/calculator')}
        >
          Transfer to Cost Estimator
        </Button>
      </div>
    </div>
  );
};
