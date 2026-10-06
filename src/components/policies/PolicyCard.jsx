// src/components/policies/PolicyCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Shield,
  FileText,
  Bot,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const PolicyCard = ({ policy, onDelete, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white p-4 rounded-2xl border border-borderGray hover:border-forest-300 hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wide">
                  {policy.provider}
                </span>
                <Badge variant={policy.status} dot size="xs">
                  {policy.status}
                </Badge>
                <Badge variant={policy.analysisStatus} size="xs">
                  {policy.analysisStatus}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 truncate font-heading mt-0.5" title={policy.name}>
                {policy.name}
              </h4>
              <p className="text-xs text-charcoal-400 font-mono">
                {policy.policyNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-charcoal-600">
            <div>
              <span className="text-charcoal-400 block text-[11px]">Sum Insured</span>
              <span className="font-bold text-forest-900 text-sm">{formatCurrency(policy.sumInsured)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-charcoal-400 block text-[11px]">Validity</span>
              <span className="font-medium text-charcoal-700">{formatDate(policy.renewalDate)}</span>
            </div>
            <div className="hidden lg:block w-32">
              <div className="flex justify-between text-[10px] text-charcoal-400 mb-1">
                <span>Utilized</span>
                <span>{policy.coverageUtilization}%</span>
              </div>
              <div className="w-full bg-forest-100/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-forest-600 h-1.5 rounded-full"
                  style={{ width: `${policy.coverageUtilization}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={FileText}
              onClick={() => navigate(`/app/policies/${policy.id}`)}
            >
              Details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Bot}
              onClick={() => navigate(`/app/assistant?policyId=${policy.id}`)}
            >
              AI
            </Button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete policy"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={() => onDelete(policy.id)}
          title="Delete Policy"
          message={`Are you sure you want to remove "${policy.name}"? All associated simulated analyses will be permanently cleared from this demo browser session.`}
          confirmText="Yes, Delete"
        />
      </>
    );
  }

  return (
    <>
      <Card padding="p-5" hover className="flex flex-col justify-between group">
        <div>
          {/* Card Top: Provider & Statuses */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0 group-hover:bg-forest-100 transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wide">
                  {policy.provider}
                </span>
                <p className="text-[11px] text-charcoal-400 font-mono">
                  {policy.policyNumber}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={policy.status} dot size="xs">
                {policy.status}
              </Badge>
              <Badge variant={policy.analysisStatus} size="xs">
                {policy.analysisStatus}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-bold text-forest-900 font-heading mb-1 line-clamp-1" title={policy.name}>
            {policy.name}
          </h4>
          <p className="text-xs text-charcoal-400 line-clamp-1 mb-4">
            {policy.type} · {policy.pageCount} Pages ({policy.fileSize})
          </p>

          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-borderGray/70 text-xs">
            <div>
              <span className="text-charcoal-400 block text-[11px]">Sum Insured</span>
              <span className="font-bold text-forest-900 text-sm">
                {formatCurrency(policy.sumInsured)}
              </span>
            </div>
            <div>
              <span className="text-charcoal-400 block text-[11px]">Renewal Date</span>
              <span className="font-semibold text-charcoal-700 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-sage-500" />
                {formatDate(policy.renewalDate)}
              </span>
            </div>
            <div>
              <span className="text-charcoal-400 block text-[11px]">Room Rent Cap</span>
              <span className="font-semibold text-charcoal-700">
                {policy.roomRentLimitPerDay > 0 ? `₹${policy.roomRentLimitPerDay}/day` : 'No Cap'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-400 block text-[11px]">Deductible / Co-pay</span>
              <span className="font-semibold text-charcoal-700">
                {policy.deductible > 0 ? `₹${policy.deductible.toLocaleString('en-IN')}` : '₹0'} / {policy.copayPercent}%
              </span>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-charcoal-500">
              <span>Coverage Utilization</span>
              <span>{policy.coverageUtilization}%</span>
            </div>
            <div className="w-full bg-forest-100/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-forest-600 h-1.5 rounded-full"
                style={{ width: `${policy.coverageUtilization}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-borderGray/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 grow">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              leftIcon={FileText}
              onClick={() => navigate(`/app/policies/${policy.id}`)}
            >
              Analyze
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
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Policy"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => onDelete(policy.id)}
        title="Delete Policy"
        message={`Are you sure you want to remove "${policy.name}"? All associated simulated analyses will be permanently cleared from this demo browser session.`}
        confirmText="Yes, Delete"
      />
    </>
  );
};
