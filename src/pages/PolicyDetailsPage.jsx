import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePolicy } from '../context/PolicyContext';
import { policyService } from '../services/policyService';
import { PolicyViewer } from '../components/policies/PolicyViewer';
import { PolicyOverviewTab } from '../components/policies/PolicyOverviewTab';
import { PolicyCoverageTab } from '../components/policies/PolicyCoverageTab';
import { PolicyExclusionsTab } from '../components/policies/PolicyExclusionsTab';
import { PolicyLimitsTab } from '../components/policies/PolicyLimitsTab';
import { PolicyClausesTab } from '../components/policies/PolicyClausesTab';
import { Button } from '../components/common/Button';
import {
  ArrowLeft,
  Bot,
  Calculator,
  Shield,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export const PolicyDetailsPage = () => {
  const { policyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { policies } = usePolicy();

  // Find policy from local list as immediate default
  const basePolicy = policies.find((p) => p.id === policyId) || policies[0];
  const [currentPolicy, setCurrentPolicy] = useState(basePolicy);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'coverage' | 'exclusions' | 'limits' | 'clauses'
  
  const pageParam = parseInt(searchParams.get('page') || '', 10);
  const clauseParam = searchParams.get('clause') || null;

  const [currentPage, setCurrentPage] = useState(!isNaN(pageParam) ? pageParam : 1);
  const [highlightedClauseId, setHighlightedClauseId] = useState(clauseParam);

  // Sync if query params change
  useEffect(() => {
    if (!isNaN(pageParam) && pageParam > 0) {
      setCurrentPage(pageParam);
    }
    if (clauseParam) {
      setHighlightedClauseId(clauseParam);
      // Switch tab to clauses if requested from source jump
      setActiveTab('clauses');
    }
  }, [pageParam, clauseParam]);

  // Fetch complete structured analysis from backend API when viewing policy
  useEffect(() => {
    const targetId = policyId || basePolicy?.id;
    if (!targetId) return;

    let isMounted = true;
    setIsLoadingAnalysis(true);

    policyService.getPolicyAnalysis(targetId)
      .then((fullData) => {
        if (isMounted && fullData) {
          setCurrentPolicy(fullData);
        }
      })
      .catch((err) => {
        console.warn('Could not load policy analysis details:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAnalysis(false);
      });

    return () => { isMounted = false; };
  }, [policyId, basePolicy?.id]);

  const activePolicy = currentPolicy || basePolicy;

  if (!activePolicy) {
    return (
      <div className="p-8 text-center">
        <p className="text-charcoal-400">Policy not found.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/app/policies')}>
          Back to Policies
        </Button>
      </div>
    );
  }

  const handleSelectClause = (clauseId, pageNumber) => {
    setHighlightedClauseId(clauseId);
    if (pageNumber) {
      setCurrentPage(pageNumber);
    }
  };

  const handleTermUpdated = (updatedLimits) => {
    setCurrentPolicy((prev) => ({
      ...prev,
      limitsAndConditions: updatedLimits,
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'exclusions', label: 'Exclusions' },
    { id: 'limits', label: 'Limits & Conditions' },
    { id: 'clauses', label: 'Key Clauses' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderGray">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/policies')}
            className="p-2 rounded-xl text-charcoal-500 hover:text-forest-900 hover:bg-forest-50 transition-colors"
            title="Back to all policies"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700">
                {activePolicy.provider}
              </span>
              <span className="text-charcoal-300">·</span>
              <span className="text-xs text-charcoal-400 font-mono">{activePolicy.policyNumber}</span>
              {isLoadingAnalysis && (
                <span className="inline-flex items-center gap-1 text-[10px] text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full font-medium">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  Syncing OCR analysis...
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-forest-900 font-heading">
              {activePolicy.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={Bot}
            onClick={() => navigate(`/app/assistant?policyId=${activePolicy.id}`)}
          >
            Ask AI Assistant
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Calculator}
            onClick={() => navigate('/app/calculator')}
          >
            Estimate Bill
          </Button>
        </div>
      </div>

      {/* Two-Panel Layout (Left: Doc Viewer, Right: Analysis Tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* Left Panel: Policy Document Viewer */}
        <div className="lg:col-span-6 h-[600px] lg:h-[720px]">
          <PolicyViewer
            policy={activePolicy}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            highlightedClauseId={highlightedClauseId}
            onClearHighlight={() => setHighlightedClauseId(null)}
          />
        </div>

        {/* Right Panel: Policy Analysis */}
        <div className="lg:col-span-6 flex flex-col bg-white rounded-2xl border border-borderGray shadow-subtle p-5 overflow-hidden h-[600px] lg:h-[720px]">
          {/* Tab Navigation Strip */}
          <div className="flex items-center space-x-1 border-b border-borderGray pb-3 shrink-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-forest-900 hover:bg-forest-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto pt-4 pr-1">
            {activeTab === 'overview' && <PolicyOverviewTab policy={activePolicy} />}
            {activeTab === 'coverage' && <PolicyCoverageTab policy={activePolicy} />}
            {activeTab === 'exclusions' && <PolicyExclusionsTab policy={activePolicy} />}
            {activeTab === 'limits' && (
              <PolicyLimitsTab
                policy={activePolicy}
                onTermUpdated={handleTermUpdated}
              />
            )}
            {activeTab === 'clauses' && (
              <PolicyClausesTab
                policy={activePolicy}
                onSelectClause={handleSelectClause}
                activeClauseId={highlightedClauseId}
              />
            )}
          </div>

          {/* Legal / Verification Disclaimer Bar */}
          <div className="mt-4 pt-3 border-t border-borderGray/70 flex items-center justify-between text-[11px] text-charcoal-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Extracted summaries are informational. Always cross-check against original PDF terms.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
