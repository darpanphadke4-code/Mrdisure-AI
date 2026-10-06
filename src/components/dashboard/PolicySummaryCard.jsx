// src/components/dashboard/PolicySummaryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Shield, ChevronRight, FileText, Bot } from 'lucide-react';

export const PolicySummaryCard = ({ policy }) => {
  const navigate = useNavigate();

  return (
    <Card padding="p-5" hover className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wide">
                {policy.provider}
              </span>
              <h4 className="text-sm font-bold text-forest-900 line-clamp-1 font-heading" title={policy.name}>
                {policy.name}
              </h4>
            </div>
          </div>
          <Badge variant={policy.status} dot size="xs">
            {policy.status}
          </Badge>
        </div>

        {/* Sum Insured & Policy Period */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-borderGray/70 my-3 text-xs">
          <div>
            <span className="text-charcoal-400 block text-[11px]">Sum Insured</span>
            <span className="font-bold text-forest-800 text-sm">
              {formatCurrency(policy.sumInsured)}
            </span>
          </div>
          <div>
            <span className="text-charcoal-400 block text-[11px]">Renewal Date</span>
            <span className="font-semibold text-charcoal-700">
              {formatDate(policy.renewalDate)}
            </span>
          </div>
        </div>

        {/* Coverage Utilization Progress */}
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between text-[11px] font-medium text-charcoal-500">
            <span>Coverage Utilized ({policy.coverageUtilization}%)</span>
            <span>{formatCurrency(policy.utilizedAmount)} / {formatCurrency(policy.sumInsured)}</span>
          </div>
          <div className="w-full bg-forest-100/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-forest-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(policy.coverageUtilization, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-borderGray/60">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          leftIcon={FileText}
          onClick={() => navigate(`/app/policies/${policy.id}`)}
        >
          View Details
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs"
          leftIcon={Bot}
          onClick={() => navigate(`/app/assistant?policyId=${policy.id}`)}
        >
          Ask AI
        </Button>
      </div>
    </Card>
  );
};
