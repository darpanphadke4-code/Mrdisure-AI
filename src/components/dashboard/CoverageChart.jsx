// src/components/dashboard/CoverageChart.jsx
import React, { useState } from 'react';
import { Card, CardHeader } from '../common/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const categoryBreakdownData = [
  { category: 'Surgery & OT', insurerShare: 110000, patientShare: 15000 },
  { category: 'Room & Boarding', insurerShare: 15000, patientShare: 9000 },
  { category: 'Doctor Rounds', insurerShare: 45000, patientShare: 0 },
  { category: 'Diagnostics', insurerShare: 18000, patientShare: 2000 },
  { category: 'Medicines', insurerShare: 26000, patientShare: 4000 },
  { category: 'Consumables', insurerShare: 2000, patientShare: 20000 },
];

export const CoverageChart = () => {
  const [activeView, setActiveView] = useState('category'); // 'category'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const insurer = payload.find((p) => p.dataKey === 'insurerShare')?.value || 0;
      const patient = payload.find((p) => p.dataKey === 'patientShare')?.value || 0;
      const total = insurer + patient;

      return (
        <div className="bg-white p-3 rounded-xl border border-borderGray shadow-elevated text-xs">
          <p className="font-bold text-forest-900 font-heading mb-1.5">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-forest-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-forest-700" />
                <span>Insurer Covered:</span>
              </span>
              <span className="font-semibold">{formatCurrency(insurer)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Patient Share:</span>
              </span>
              <span className="font-semibold">{formatCurrency(patient)}</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-borderGray flex justify-between font-bold text-charcoal-800">
              <span>Total Category Bill:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="p-5" className="h-full flex flex-col">
      <CardHeader
        title="Hospitalization Coverage Distribution"
        subtitle="Illustrative claim payout vs out-of-pocket patient share by category"
      />

      <div className="h-72 w-full grow mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryBreakdownData}
            margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8ECE8" />
            <XAxis
              dataKey="category"
              tick={{ fill: '#6C7B74', fontSize: 11 }}
              axisLine={{ stroke: '#E8ECE8' }}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: '#6C7B74', fontSize: 11 }}
              axisLine={{ stroke: '#E8ECE8' }}
              tickLine={false}
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Bar
              name="Insurer Covered"
              dataKey="insurerShare"
              stackId="a"
              fill="#174C3C"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              name="Patient Out-of-Pocket"
              dataKey="patientShare"
              stackId="a"
              fill="#E11D48"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-borderGray/60 flex items-center justify-between text-[11px] text-charcoal-400">
        <span>*Based on standard Laparoscopic Gallbladder hospitalization benchmark.</span>
        <span className="font-medium text-forest-700">Admissible Rate: ~84%</span>
      </div>
    </Card>
  );
};
