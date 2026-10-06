// src/components/calculator/WaterfallChart.jsx
import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const WaterfallChart = ({ steps = [], totalBilled, insurerShare, patientShare }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-borderGray">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-forest-900 font-heading">
            Settlement Waterfall Flow
          </h4>
          <p className="text-xs text-charcoal-400">
            Step-by-step reduction from Gross Hospital Bill to Net Payable Payout
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
            <span className="font-semibold text-forest-900">Insurer: {formatCurrency(insurerShare)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="font-semibold text-rose-700">Patient: {formatCurrency(patientShare)}</span>
          </span>
        </div>
      </div>

      {/* Waterfall Visual Bars */}
      <div className="space-y-3 mt-4">
        {steps.map((step, idx) => {
          const isNegative = step.value < 0;
          const displayVal = Math.abs(step.value);
          const percentOfTotal = totalBilled > 0 ? Math.min(Math.round((displayVal / totalBilled) * 100), 100) : 0;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-charcoal-700 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                  <span>{step.name}</span>
                </span>
                <span
                  className={`font-mono font-bold ${
                    step.type === 'start'
                      ? 'text-charcoal-900'
                      : step.type === 'final'
                      ? 'text-forest-800'
                      : 'text-rose-600'
                  }`}
                >
                  {isNegative ? '-' : ''}{formatCurrency(displayVal)}
                  {step.type !== 'start' && totalBilled > 0 && (
                    <span className="text-[10px] text-charcoal-400 ml-1.5 font-sans font-normal">
                      ({percentOfTotal}%)
                    </span>
                  )}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-warmWhite rounded-full h-2.5 overflow-hidden border border-borderGray/50">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentOfTotal}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
