// src/components/policies/PolicyViewer.jsx
import React, { useState } from 'react';
import { Card } from '../common/Card';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  FileText,
  Bookmark,
  Shield,
  Eye,
} from 'lucide-react';

export const PolicyViewer = ({
  policy,
  currentPage,
  setCurrentPage,
  highlightedClauseId,
  onClearHighlight,
}) => {
  const [zoom, setZoom] = useState(100);
  const [docSearch, setDocSearch] = useState('');

  const pages = policy?.documentExcerpt?.pages || [];
  const totalPages = pages.length > 0 ? pages.length : 1;
  const activePageData = pages.find((p) => p.pageNumber === currentPage) || pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 75));
  const handleResetZoom = () => setZoom(100);

  // Filter sections by search text if provided
  const sectionsToDisplay = activePageData?.sections || [];

  return (
    <div className="bg-white rounded-2xl border border-borderGray shadow-subtle flex flex-col h-full overflow-hidden">
      {/* Viewer Header Toolbar */}
      <div className="px-4 py-3 border-b border-borderGray bg-warmWhite/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-forest-900 truncate max-w-[200px] sm:max-w-xs font-heading">
              {policy.name}.pdf
            </h4>
            <span className="text-[10px] text-charcoal-400 block -mt-0.5">
              Verified Optical Layout Extraction
            </span>
          </div>
        </div>

        {/* Search Inside Document */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search in document..."
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            className="pl-8 pr-3 py-1 bg-white border border-borderGray rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-forest-500 w-36 sm:w-44"
          />
        </div>

        {/* Zoom & Page Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-white border border-borderGray rounded-lg p-0.5 text-charcoal-600">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-forest-800 hover:bg-forest-50 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-medium select-none">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-forest-800 hover:bg-forest-50 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:text-forest-800 hover:bg-forest-50 rounded"
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Page Controls */}
          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg border border-borderGray hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-charcoal-800 min-w-[55px] text-center text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg border border-borderGray hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Highlight Active Alert banner */}
      {highlightedClauseId && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Bookmark className="w-3.5 h-3.5 text-amber-700" />
            <span>Viewing clause cross-reference highlighted in document below</span>
          </span>
          <button
            onClick={onClearHighlight}
            className="text-[11px] font-bold text-amber-800 hover:underline"
          >
            Clear Highlight
          </button>
        </div>
      )}

      {/* Document Content Page Viewer */}
      <div className="flex-1 bg-warmWhite/50 p-4 sm:p-6 overflow-y-auto">
        <div
          className="mx-auto bg-white border border-borderGray shadow-sm rounded-xl p-8 transition-transform duration-200 min-h-[500px]"
          style={{
            maxWidth: `${Math.round(680 * (zoom / 100))}px`,
            fontSize: `${(zoom / 100) * 0.875}rem`,
          }}
        >
          {/* Faux PDF Document Header */}
          <div className="border-b-2 border-forest-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <span className="text-[10px] tracking-wider uppercase font-bold text-forest-700">
                Official Policy Schedule & Terms
              </span>
              <h3 className="text-base font-bold text-charcoal-900 mt-0.5">
                {activePageData?.title || 'Policy Terms'}
              </h3>
            </div>
            <div className="text-right text-[10px] text-charcoal-400">
              <div>Policy No: {policy.policyNumber}</div>
              <div>Page {currentPage} of {totalPages}</div>
            </div>
          </div>

          {/* Page Sections */}
          <div className="space-y-6">
            {sectionsToDisplay.map((sec) => {
              const isClauseHighlighted =
                highlightedClauseId && sec.clauses?.includes(highlightedClauseId);

              // Check search match
              const matchesSearch =
                docSearch &&
                (sec.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                  sec.content.toLowerCase().includes(docSearch.toLowerCase()));

              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isClauseHighlighted
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/50 shadow-sm'
                      : matchesSearch
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'border-borderGray/70 hover:border-forest-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h5
                      className={`text-xs font-bold ${
                        isClauseHighlighted ? 'text-amber-900 font-heading' : 'text-forest-900 font-heading'
                      }`}
                    >
                      {sec.title}
                    </h5>
                    {isClauseHighlighted && (
                      <span className="text-[9px] uppercase font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        Selected Clause
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-700 leading-relaxed font-serif">
                    {sec.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Faux PDF Document Footer */}
          <div className="mt-12 pt-4 border-t border-borderGray text-[10px] text-charcoal-400 flex justify-between items-center">
            <span>MediSure Optical Document Representation · Not a legal original</span>
            <span>Confidential & Proprietary</span>
          </div>
        </div>
      </div>
    </div>
  );
};
