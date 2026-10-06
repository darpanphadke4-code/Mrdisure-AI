// src/components/calculator/ResultsStep.jsx
import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { WaterfallChart } from './WaterfallChart';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ResultsStep = ({
  estimate,
  patientInfo,
  policy,
  onSaveReport,
  onEditScenario,
  onDownloadReport,
}) => {
  const [showAppliedRules, setShowAppliedRules] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveReport();
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Executive Overview Banner */}
      <div className="bg-white p-6 rounded-2xl border border-borderGray shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-borderGray">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="verified" dot size="sm">
                Simulation Complete
              </Badge>
              <span className="text-xs text-charcoal-400 font-mono">
                Policy: {policy?.name}
              </span>
            </div>
            <h3 className="text-xl font-bold text-forest-900 font-heading">
              Estimated Out-of-Pocket Expense Settlement
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Patient: <strong>{patientInfo?.patientName || 'Primary Insured'}</strong> ({patientInfo?.diagnosis || 'Planned Inpatient'}) · {patientInfo?.hospitalName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={onEditScenario}
            >
              Edit Scenario
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Save}
              disabled={isSaved}
              onClick={handleSave}
            >
              {isSaved ? 'Saved to Reports' : 'Save Analysis'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Download}
              onClick={onDownloadReport}
            >
              Download PDF / Print
            </Button>
          </div>
        </div>

        {/* Big Key Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Gross Bill */}
          <div className="p-4 rounded-xl bg-warmWhite border border-borderGray">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block">
              Gross Hospital Bill
            </span>
            <span className="text-2xl font-bold text-charcoal-900 font-mono mt-1 block">
              {formatCurrency(estimate.totalBilled)}
            </span>
            <span className="text-[11px] text-charcoal-400">
              {estimate.itemizedDetails?.length || 0} Line Items Billed
            </span>
          </div>

          {/* Insurer Share */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              Estimated Insurer Payout
            </span>
            <span className="text-2xl font-bold text-forest-900 font-mono mt-1 block">
              {formatCurrency(estimate.estimatedInsurerShare)}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-emerald-700">
                {estimate.insurerCoverageRatio}% of total bill covered
              </span>
            </div>
          </div>

          {/* Patient Out-of-Pocket Share */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
              Patient Out-of-Pocket Cost
            </span>
            <span className="text-2xl font-bold text-rose-700 font-mono mt-1 block">
              {formatCurrency(estimate.estimatedPatientShare)}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-rose-600">
                {estimate.patientShareRatio}% self-funded deductions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Waterfall Visual Breakdown */}
      <WaterfallChart
        steps={estimate.waterfallSteps}
        totalBilled={estimate.totalBilled}
        insurerShare={estimate.estimatedInsurerShare}
        patientShare={estimate.estimatedPatientShare}
      />

      {/* Detailed Calculation Deduction Table */}
      <div className="bg-white rounded-2xl border border-borderGray overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-borderGray flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-forest-900 font-heading">
              Detailed Claim Deduction Audit Table
            </h4>
            <p className="text-xs text-charcoal-400">
              Item-by-item breakdown of admissible vs non-admissible deductions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-warmWhite/80 text-charcoal-500 uppercase text-[10px] border-b border-borderGray">
              <tr>
                <th className="px-4 py-3">Expense Item</th>
                <th className="px-4 py-3 text-right">Billed Amount</th>
                <th className="px-4 py-3 text-right">Deduction</th>
                <th className="px-4 py-3 text-right">Admissible Share</th>
                <th className="px-4 py-3">Policy Audit Clause / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGray/60">
              {estimate.itemizedDetails?.map((item, index) => (
                <tr key={index} className="hover:bg-warmWhite/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-charcoal-800 block">{item.description}</span>
                    <span className="text-[10px] text-charcoal-400 uppercase">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-charcoal-800">
                    {formatCurrency(item.itemTotal)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                    {item.itemDeduction > 0 ? `-${formatCurrency(item.itemDeduction)}` : '₹0'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-forest-900">
                    {formatCurrency(item.itemAdmissible)}
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Global Policy Step Deductions (Deductible, Co-pay) */}
        <div className="bg-warmWhite/60 p-4 border-t border-borderGray space-y-2 text-xs">
          <div className="flex justify-between text-charcoal-600">
            <span>Cumulative Admissible Base before Policy Caps:</span>
            <span className="font-mono font-semibold">{formatCurrency(estimate.admissibleExpenses)}</span>
          </div>
          {estimate.deductibleApplied > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Less: Annual Aggregate Deductible (Clause 1.2):</span>
              <span className="font-mono font-bold">-{formatCurrency(estimate.deductibleApplied)}</span>
            </div>
          )}
          {estimate.copayApplied > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Less: Applicable Co-Payment ({policy?.copayPercent}%):</span>
              <span className="font-mono font-bold">-{formatCurrency(estimate.copayApplied)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-forest-900 pt-2 border-t border-borderGray text-sm">
            <span>Net Insurer Payout Approved:</span>
            <span className="font-mono">{formatCurrency(estimate.estimatedInsurerShare)}</span>
          </div>
        </div>
      </div>

      {/* Applied Policy Rules Accordion */}
      <div className="bg-white rounded-2xl border border-borderGray overflow-hidden">
        <button
          onClick={() => setShowAppliedRules(!showAppliedRules)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-warmWhite/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-forest-700" />
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider font-heading">
              View Applied Policy Rules & Formulas
            </span>
          </div>
          {showAppliedRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAppliedRules && (
          <div className="p-4 pt-0 border-t border-borderGray/60 space-y-3 text-xs text-charcoal-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="p-3 bg-warmWhite rounded-xl border border-borderGray">
                <strong className="text-charcoal-900 block mb-1">Room Rent Proportionate Rule</strong>
                <span>If room charge exceeds daily cap of ₹{policy?.roomRentLimitPerDay || 5000}, excess daily tariff × days is deducted from final eligible claim.</span>
              </div>
              <div className="p-3 bg-warmWhite rounded-xl border border-borderGray">
                <strong className="text-charcoal-900 block mb-1">Consumables & Hygiene Packs</strong>
                <span>Non-medical items under IRDAI Annexure I are excluded at 85-90% unless covered by an active Care Shield / Consumables rider.</span>
              </div>
              <div className="p-3 bg-warmWhite rounded-xl border border-borderGray">
                <strong className="text-charcoal-900 block mb-1">Deductible Fulfillment</strong>
                <span>Annual deductible of ₹{policy?.deductible || 0} is borne first before insurance indemnity is disbursed.</span>
              </div>
              <div className="p-3 bg-warmWhite rounded-xl border border-borderGray">
                <strong className="text-charcoal-900 block mb-1">Co-Payment Calculation</strong>
                <span>Calculated as {policy?.copayPercent || 0}% on the net amount remaining after deductible subtraction.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prominent Legal & Estimate Disclaimer */}
      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300/70 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-heading font-bold block">
            Important Estimate Disclaimer
          </strong>
          <p className="leading-relaxed text-charcoal-700">
            This estimation is generated by the MediSure AI mathematical rules engine based on user-entered values and extracted policy parameters. Final cashless pre-authorization or claim reimbursement approval rests solely with your insurance company and designated TPA upon medical review of hospital discharge summaries and original bills.
          </p>
        </div>
      </div>
    </div>
  );
};
