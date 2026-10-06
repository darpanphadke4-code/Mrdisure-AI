// src/components/reports/ReportCard.jsx
import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileBarChart,
  Eye,
  Printer,
  Trash2,
  Calendar,
  Building,
  User,
} from 'lucide-react';

export const ReportCard = ({ report, onPreview, onPrint, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Card padding="p-5" hover className="flex flex-col justify-between group">
        <div>
          {/* Header & Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0 group-hover:bg-forest-100 transition-colors">
                <FileBarChart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-charcoal-400 block">
                  {report.id}
                </span>
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wide truncate block">
                  {report.provider}
                </span>
              </div>
            </div>
            <Badge variant={report.status} dot size="xs">
              {report.status}
            </Badge>
          </div>

          {/* Report Title & Patient Scenario */}
          <h4 className="text-sm font-bold text-charcoal-900 font-heading mb-1 line-clamp-1" title={report.reportName}>
            {report.reportName}
          </h4>
          <p className="text-xs text-charcoal-500 line-clamp-1 mb-3">
            {report.diagnosis} · {report.hospitalName}
          </p>

          {/* Patient and Date details */}
          <div className="py-2.5 border-y border-borderGray/70 grid grid-cols-2 gap-2 text-[11px] text-charcoal-500 my-2">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-sage-500 shrink-0" />
              <span className="truncate">{report.patientName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sage-500 shrink-0" />
              <span>{formatDate(report.dateCreated)}</span>
            </div>
          </div>

          {/* Key Amount Comparison */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div>
              <span className="text-[10px] text-emerald-800 font-medium block">
                Insurer Share
              </span>
              <span className="font-bold text-forest-900 font-mono text-sm">
                {formatCurrency(report.estimatedInsurerShare)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-rose-800 font-medium block">
                Patient Out-of-Pocket
              </span>
              <span className="font-bold text-rose-700 font-mono text-sm">
                {formatCurrency(report.estimatedPatientShare)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-3 border-t border-borderGray/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 grow">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              leftIcon={Eye}
              onClick={() => onPreview(report)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              leftIcon={Printer}
              onClick={() => onPrint(report)}
            >
              Print
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete report"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onDelete(report.id)}
        title="Delete Report"
        message={`Are you sure you want to remove the saved report for "${report.reportName}"?`}
        confirmText="Yes, Delete"
      />
    </>
  );
};
