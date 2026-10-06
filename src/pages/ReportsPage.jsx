// src/pages/ReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { usePolicy } from '../context/PolicyContext';
import { reportService } from '../services/reportService';
import { ReportCard } from '../components/reports/ReportCard';
import { ReportModal } from '../components/reports/ReportModal';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart,
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

export const ReportsPage = () => {
  const { reports, deleteReport } = usePolicy();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [activePreviewReport, setActivePreviewReport] = useState(null);

  // Filter & Sort Logic
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        const matchesSearch =
          r.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.policyName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedStatus === 'All' || r.status.toLowerCase() === selectedStatus.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.dateCreated) - new Date(b.dateCreated);
        }
        if (sortBy === 'amount-desc') {
          return b.totalBilled - a.totalBilled;
        }
        if (sortBy === 'amount-asc') {
          return a.totalBilled - b.totalBilled;
        }
        return 0;
      });
  }, [reports, searchQuery, selectedStatus, sortBy]);

  const handlePrint = (report) => {
    reportService.printReport(report);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-forest-900 font-heading">
            Settlement & Claim Audit Reports
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-0.5">
            Archived simulations and out-of-pocket hospital expense audit sheets
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => navigate('/app/calculator')}
        >
          Generate New Report
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-borderGray shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by diagnosis, patient name, or policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs sm:text-sm text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-forest-500"
          >
            <option value="All">Status: All</option>
            <option value="Completed">Status: Completed</option>
            <option value="Verified">Status: Verified</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-forest-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Billed</option>
            <option value="amount-asc">Lowest Billed</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No Reports Match Your Search"
          description="Simulate a hospital bill in the Cost Estimator to create and save detailed settlement audit reports."
          actionLabel="Open Cost Estimator"
          onAction={() => navigate('/app/calculator')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPreview={(r) => setActivePreviewReport(r)}
              onPrint={handlePrint}
              onDelete={deleteReport}
            />
          ))}
        </div>
      )}

      {/* Full Preview & Print Modal */}
      <ReportModal
        isOpen={!!activePreviewReport}
        onClose={() => setActivePreviewReport(null)}
        report={activePreviewReport}
        onPrint={handlePrint}
      />
    </div>
  );
};
