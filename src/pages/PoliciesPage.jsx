// src/pages/PoliciesPage.jsx
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePolicy } from '../context/PolicyContext';
import { PolicyCard } from '../components/policies/PolicyCard';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';

export const PoliciesPage = () => {
  const { onOpenUpload } = useOutletContext();
  const { policies, deletePolicy } = usePolicy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('uploadDate-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Extract unique providers for filter
  const providers = useMemo(() => {
    const list = Array.from(new Set(policies.map((p) => p.provider)));
    return ['All', ...list];
  }, [policies]);

  // Filter & Sort Logic
  const filteredPolicies = useMemo(() => {
    return policies
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProvider =
          selectedProvider === 'All' || p.provider === selectedProvider;

        const matchesStatus =
          selectedStatus === 'All' || p.status.toLowerCase() === selectedStatus.toLowerCase();

        return matchesSearch && matchesProvider && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'uploadDate-desc') {
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        }
        if (sortBy === 'uploadDate-asc') {
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        }
        if (sortBy === 'sumInsured-desc') {
          return b.sumInsured - a.sumInsured;
        }
        if (sortBy === 'sumInsured-asc') {
          return a.sumInsured - b.sumInsured;
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [policies, searchQuery, selectedProvider, selectedStatus, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-forest-900 font-heading">
            My Insurance Policies
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-0.5">
            Manage your uploaded health insurance schedules, OCR extractions, and policy riders
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={onOpenUpload}
        >
          Upload New Policy
        </Button>
      </div>

      {/* Search, Filters & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderGray shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by policy name, provider, or masked number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs sm:text-sm text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Filter */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-forest-500"
          >
            {providers.map((prv) => (
              <option key={prv} value={prv}>
                Provider: {prv}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-forest-500"
          >
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Pending Analysis">Status: Pending</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-warmWhite border border-borderGray rounded-xl text-xs font-semibold text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-forest-500"
          >
            <option value="uploadDate-desc">Newest Uploaded</option>
            <option value="uploadDate-asc">Oldest Uploaded</option>
            <option value="sumInsured-desc">Highest Sum Insured</option>
            <option value="sumInsured-asc">Lowest Sum Insured</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-warmWhite border border-borderGray rounded-xl p-1 text-charcoal-500">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'hover:text-charcoal-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'hover:text-charcoal-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Policies Display */}
      {filteredPolicies.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No Policies Match Your Filter"
          description="Try clearing your search terms or filter criteria, or upload a new policy document."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedProvider('All');
            setSelectedStatus('All');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onDelete={deletePolicy}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onDelete={deletePolicy}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
};
