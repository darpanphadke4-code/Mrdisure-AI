// src/pages/DashboardPage.jsx
import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { usePolicy } from '../context/PolicyContext';
import { StatCard } from '../components/dashboard/StatCard';
import { PolicySummaryCard } from '../components/dashboard/PolicySummaryCard';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { QuickActions } from '../components/dashboard/QuickActions';
import { CoverageChart } from '../components/dashboard/CoverageChart';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import {
  ShieldCheck,
  Shield,
  FileCheck2,
  Calculator,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage = () => {
  const { onOpenUpload } = useOutletContext();
  const { policies, reports, user, activities } = usePolicy();
  const navigate = useNavigate();

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Compute aggregate stats from centralized data
  const totalPoliciesCount = policies.length;
  const totalActiveCoverage = policies.reduce((sum, p) => sum + (Number(p.sumInsured) || 0), 0);
  const totalReportsCount = reports.length;
  const totalExpensesAnalyzed = reports.reduce((sum, r) => sum + (Number(r.totalBilled) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-forest-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card">
        {/* Subtle decorative background circle */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-forest-700/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-800 text-softTeal text-[11px] font-semibold border border-forest-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Personal Insurance Portfolio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              {getGreeting()}, {user.name.split(' ')[0]}.
            </h2>
            <p className="text-xs sm:text-sm text-sage-200 max-w-xl leading-relaxed">
              Here&apos;s an overview of your active insurance policies, recent clause extraction audits, and simulated hospital out-of-pocket estimations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="md"
              leftIcon={Plus}
              onClick={onOpenUpload}
            >
              Upload Policy
            </Button>
            <Button
              variant="outline"
              size="md"
              className="bg-transparent border-sage-300 text-white hover:bg-forest-800"
              onClick={() => navigate('/app/calculator')}
            >
              New Estimate
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Policies"
          value={totalPoliciesCount}
          subtitle="Family floater & individual"
          icon={Shield}
          trend="+1 Added"
          trendPositive={true}
        />
        <StatCard
          title="Active Coverage"
          value={`₹${(totalActiveCoverage / 100000).toFixed(1)}L`}
          subtitle="Combined sum insured"
          icon={ShieldCheck}
          trend="100% Active"
          trendPositive={true}
        />
        <StatCard
          title="Analyses Completed"
          value={totalReportsCount}
          subtitle="Audit reports generated"
          icon={FileCheck2}
          trend="Audited"
          trendPositive={true}
        />
        <StatCard
          title="Estimated Analyzed"
          value={formatCurrency(totalExpensesAnalyzed)}
          subtitle="Simulated medical claims"
          icon={Calculator}
          trend="₹1.1L Saved"
          trendPositive={true}
        />
      </div>

      {/* Quick Action Shortcuts */}
      <QuickActions onOpenUpload={onOpenUpload} />

      {/* Middle Row: Policy Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-forest-900 font-heading">
              My Active Health Policies
            </h3>
            <p className="text-xs text-charcoal-400">
              Track room rent capping, annual deductibles, and coverage balances
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/app/policies')}
          >
            View All Policies
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((policy) => (
            <PolicySummaryCard key={policy.id} policy={policy} />
          ))}
        </div>
      </div>

      {/* Bottom Grid: Analytics Chart + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CoverageChart />
        </div>
        <div className="lg:col-span-5">
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
};
