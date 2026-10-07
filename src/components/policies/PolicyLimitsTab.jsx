// src/components/policies/PolicyLimitsTab.jsx
import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { policyService } from '../../services/policyService';
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PolicyLimitsTab = ({ policy, onTermUpdated }) => {
  const [limits, setLimits] = useState(policy?.limitsAndConditions || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync if policy prop changes
  React.useEffect(() => {
    if (policy?.limitsAndConditions) {
      setLimits(policy.limitsAndConditions);
    }
  }, [policy]);

  const handleStartEdit = (index, currentVal) => {
    setEditingIndex(index);
    setEditValue(currentVal || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSaveEdit = async (index, limitItem) => {
    if (!editValue.trim()) {
      toast.error('Please enter a valid value');
      return;
    }

    setIsSaving(true);
    try {
      const termId = limitItem.term_id || `term-${index}`;
      await policyService.updatePolicyTerm(policy.id, termId, editValue.trim());

      const updatedLimits = [...limits];
      updatedLimits[index] = {
        ...limitItem,
        value: editValue.trim(),
        extracted_value: limitItem.extracted_value || limitItem.value,
        verified: true,
      };

      setLimits(updatedLimits);
      setEditingIndex(null);
      toast.success(`Saved and marked "${limitItem.name}" as Manually Verified`);

      if (onTermUpdated) {
        onTermUpdated(updatedLimits);
      }
    } catch (e) {
      toast.error('Failed to update term');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-borderGray">
        <div>
          <h4 className="text-sm font-bold text-forest-900 font-heading">
            Financial Limits, Deductibles & Co-Payments
          </h4>
          <p className="text-xs text-charcoal-400">
            Review AI extracted values or manually verify policy terms
          </p>
        </div>
        <span className="text-xs font-semibold text-forest-800 bg-forest-100 px-2.5 py-1 rounded-full">
          {limits.length} Extracted Terms
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {limits.map((limit, idx) => {
          const isEditing = editingIndex === idx;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                limit.verified
                  ? 'bg-white border-emerald-200 shadow-xs'
                  : 'bg-white border-borderGray hover:border-forest-300'
              }`}
            >
              <div>
                {/* Header: Label and Verification Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-charcoal-800 font-heading">
                    {limit.name}
                  </span>

                  {limit.verified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Manually Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-softTeal text-forest-900 border border-softTeal-border">
                      <Sparkles className="w-3 h-3 text-forest-700" />
                      AI Extracted
                    </span>
                  )}
                </div>

                {/* Value or Inline Edit Input */}
                {isEditing ? (
                  <div className="my-2 space-y-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-1.5 bg-warmWhite border border-forest-500 rounded-lg text-xs font-bold text-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-500 font-mono"
                      placeholder="e.g. ₹10,00,000"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="xs"
                        leftIcon={Save}
                        isLoading={isSaving}
                        onClick={() => handleSaveEdit(idx, limit)}
                      >
                        Save & Verify
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        leftIcon={X}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between my-1">
                    <span className="text-lg font-bold text-forest-900 font-mono">
                      {limit.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx, limit.value)}
                      className="p-1 rounded text-charcoal-400 hover:text-forest-700 hover:bg-forest-50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      title="Edit this extracted value"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}

                {/* Original Extracted Value Preservation */}
                {limit.extracted_value && limit.extracted_value !== limit.value && (
                  <div className="text-[10px] text-charcoal-400 font-mono mb-1">
                    Original Extracted: <span className="line-through">{limit.extracted_value}</span>
                  </div>
                )}

                <p className="text-xs text-charcoal-500 leading-relaxed mt-1">
                  {limit.description}
                </p>
              </div>

              {/* Source Page Citation Footer */}
              <div className="mt-3 pt-2 border-t border-borderGray/60 flex items-center justify-between text-[10px] text-charcoal-400">
                {limit.source_page ? (
                  <span className="inline-flex items-center gap-1 text-forest-800 font-medium">
                    <FileText className="w-3 h-3 text-forest-600" />
                    <span>Source: Page {limit.source_page}</span>
                  </span>
                ) : (
                  <span>General policy schedule</span>
                )}
                {limit.confidence_score ? (
                  <span>Confidence: {Math.round(limit.confidence_score * 100)}%</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
