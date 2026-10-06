// src/components/policies/PolicyClausesTab.jsx
import React from 'react';
import { Button } from '../common/Button';
import { Bookmark, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

export const PolicyClausesTab = ({ policy, onSelectClause, activeClauseId }) => {
  const clauses = policy.keyClauses || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-borderGray">
        <div>
          <h4 className="text-sm font-bold text-forest-900 font-heading">
            Extracted Key Policy Clauses
          </h4>
          <p className="text-xs text-charcoal-400">
            Click &apos;View in Document&apos; to jump to and highlight the original text
          </p>
        </div>
        <span className="text-xs font-semibold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
          {clauses.length} Clauses
        </span>
      </div>

      <div className="space-y-3">
        {clauses.map((clause) => {
          const isActive = activeClauseId === clause.id;

          return (
            <div
              key={clause.id}
              className={`p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-300/60 shadow-sm'
                  : 'bg-white border-borderGray hover:border-forest-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Bookmark className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-forest-700'}`} />
                  <h5 className="text-xs font-bold text-charcoal-900 font-heading">
                    {clause.title}
                  </h5>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-warmWhite border border-borderGray rounded text-charcoal-600">
                  Page {clause.pageNumber}
                </span>
              </div>

              {/* Exact Snippet Quote */}
              <blockquote className="text-xs italic text-charcoal-600 bg-warmWhite/70 p-2.5 rounded-lg border-l-2 border-forest-600 my-2">
                &ldquo;{clause.snippet}&rdquo;
              </blockquote>

              {/* Plain English Explanation */}
              <p className="text-xs text-charcoal-700 leading-relaxed mt-2">
                <strong className="text-forest-900">What this means:</strong> {clause.explanation}
              </p>

              {/* View Original Clause Button */}
              <div className="mt-3 pt-2.5 border-t border-borderGray/60 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  clause.importance === 'Critical' ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  Priority: {clause.importance}
                </span>

                <Button
                  variant={isActive ? "primary" : "outline"}
                  size="xs"
                  rightIcon={ArrowRight}
                  onClick={() => onSelectClause(clause.id, clause.pageNumber)}
                >
                  {isActive ? 'Currently Highlighted' : 'View in Document'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
