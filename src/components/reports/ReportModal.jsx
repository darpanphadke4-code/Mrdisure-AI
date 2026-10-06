// src/components/reports/ReportModal.jsx
import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, Shield, Calendar, User, Building, AlertTriangle } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, report, onPrint }) => {
  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={report.reportName}
      subtitle={`Generated on ${formatDate(report.dateCreated)} · Ref: ${report.id}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs text-charcoal-700">
        {/* Policy & Hospital Strip */}
        <div className="bg-warmWhite p-4 rounded-xl border border-borderGray flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              {report.provider}
            </span>
            <h4 className="text-sm font-bold text-charcoal-900 font-heading">
              {report.policyName}
            </h4>
          </div>
          <Badge variant={report.status} dot size="sm">
            {report.status}
          </Badge>
        </div>

        {/* Patient Case Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-borderGray">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Patient</span>
            <span className="font-bold text-charcoal-900 block mt-0.5">{report.patientName}</span>
            <span className="text-[10px] text-charcoal-400">Age: {report.patientAge}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-borderGray">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Diagnosis</span>
            <span className="font-bold text-charcoal-900 block mt-0.5">{report.diagnosis}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-borderGray">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Hospital</span>
            <span className="font-bold text-charcoal-900 block mt-0.5">{report.hospitalName}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-borderGray">
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Admission</span>
            <span className="font-bold text-charcoal-900 block mt-0.5">
              {formatDate(report.admissionDate)} - {formatDate(report.dischargeDate)}
            </span>
          </div>
        </div>

        {/* Executive Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold uppercase text-emerald-800 block">
              Estimated Insurer Payout
            </span>
            <span className="text-2xl font-bold text-forest-900 font-mono mt-1 block">
              {formatCurrency(report.estimatedInsurerShare)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-[11px] font-bold uppercase text-rose-800 block">
              Estimated Patient Out-of-Pocket
            </span>
            <span className="text-2xl font-bold text-rose-700 font-mono mt-1 block">
              {formatCurrency(report.estimatedPatientShare)}
            </span>
          </div>
        </div>

        {/* Deduction Summary Ledger */}
        <div className="border border-borderGray rounded-xl overflow-hidden bg-white">
          <div className="bg-warmWhite px-4 py-2 font-bold text-charcoal-800 uppercase text-[10px] border-b border-borderGray">
            Audit Calculation Breakdown
          </div>
          <div className="divide-y divide-borderGray/60">
            <div className="px-4 py-2.5 flex justify-between">
              <span>Gross Billed Amount:</span>
              <span className="font-mono font-bold text-charcoal-900">{formatCurrency(report.totalBilled)}</span>
            </div>
            {report.nonPayableDeductions > 0 && (
              <div className="px-4 py-2.5 flex justify-between text-rose-600">
                <span>Non-payable Consumables / Admin:</span>
                <span className="font-mono font-semibold">-{formatCurrency(report.nonPayableDeductions)}</span>
              </div>
            )}
            {report.roomRentDeductions > 0 && (
              <div className="px-4 py-2.5 flex justify-between text-rose-600">
                <span>Room Rent Proportionate Reduction:</span>
                <span className="font-mono font-semibold">-{formatCurrency(report.roomRentDeductions)}</span>
              </div>
            )}
            {report.deductibleApplied > 0 && (
              <div className="px-4 py-2.5 flex justify-between text-amber-700">
                <span>Annual Deductible Applied:</span>
                <span className="font-mono font-semibold">-{formatCurrency(report.deductibleApplied)}</span>
              </div>
            )}
            {report.copayApplied > 0 && (
              <div className="px-4 py-2.5 flex justify-between text-rose-600">
                <span>Co-Payment Deducted:</span>
                <span className="font-mono font-semibold">-{formatCurrency(report.copayApplied)}</span>
              </div>
            )}
            <div className="px-4 py-3 flex justify-between font-bold bg-forest-50/70 text-forest-900 text-sm">
              <span>Net Insurer Payout Approved:</span>
              <span className="font-mono">{formatCurrency(report.estimatedInsurerShare)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {report.notes && (
          <div className="p-3 bg-warmWhite rounded-xl border border-borderGray text-charcoal-600">
            <strong className="text-charcoal-900 block mb-1">Clinical Scenario Notes:</strong>
            <p>{report.notes}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            This report was simulated using MediSure AI. Official settlements are subject to original bills and medical review by the insurer/TPA.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-borderGray">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            leftIcon={Printer}
            onClick={() => onPrint(report)}
          >
            Print / Export Document
          </Button>
        </div>
      </div>
    </Modal>
  );
};
