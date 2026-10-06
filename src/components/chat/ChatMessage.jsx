// src/components/chat/ChatMessage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ChatMessage = ({ message, onTransferEstimate }) => {
  const isUser = message.sender === 'user';
  const [showExplanation, setShowExplanation] = useState(true);
  const navigate = useNavigate();

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-forest-700 text-white flex items-center justify-center shrink-0 shadow-subtle mt-0.5">
          <Bot className="w-4 h-4 text-softTeal" />
        </div>
      )}

      {/* Message Body */}
      <div className={`max-w-[85%] sm:max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-forest-700 text-white rounded-tr-none shadow-sm'
              : 'bg-white border border-borderGray text-charcoal-800 rounded-tl-none shadow-subtle'
          }`}
        >
          {/* Main Text Content */}
          <div className="whitespace-pre-wrap">{message.text}</div>

          {/* Assistant Specific Enhancements */}
          {!isUser && (
            <div className="mt-3 space-y-3 pt-3 border-t border-borderGray/70 text-xs">
              {/* Expandable Technical Explanation */}
              {message.explanation && (
                <div>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-1.5 font-bold text-forest-800 hover:text-forest-900 transition-colors"
                  >
                    <span>Policy Analysis Breakdown</span>
                    {showExplanation ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showExplanation && (
                    <div className="mt-1.5 p-2.5 bg-forest-50/60 rounded-xl border border-forest-100 text-charcoal-700 leading-relaxed font-normal">
                      {message.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Cited Clauses Box */}
              {message.clauses && message.clauses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 block">
                    Referenced Policy Clauses
                  </span>
                  {message.clauses.map((clause, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-warmWhite rounded-lg border border-borderGray flex items-start gap-2"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                      <div className="min-w-0 grow">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-forest-900 text-[11px]">
                            {clause.title}
                          </span>
                          {clause.page && (
                            <span className="text-[10px] text-charcoal-400 font-mono">
                              Page {clause.page}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-charcoal-600 italic mt-0.5 line-clamp-2">
                          &ldquo;{clause.snippet}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Confidence & Disclaimer Tag */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                {message.confidence && (
                  <span className="inline-flex items-center gap-1 text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full font-medium text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-forest-700" />
                    <span>Confidence: {message.confidence}</span>
                  </span>
                )}

                <span className="text-charcoal-400 text-[10px] ml-auto">
                  {message.timestamp}
                </span>
              </div>

              {/* Transfer to Cost Estimator Button */}
              {message.hasTransferableEstimate && (
                <div className="mt-2 pt-2 border-t border-forest-100 flex items-center justify-between bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">
                      Simulate full bill calculation with these limits
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="xs"
                    rightIcon={ArrowRight}
                    onClick={() => {
                      if (onTransferEstimate) {
                        onTransferEstimate(message.estimatePayload);
                      } else {
                        navigate('/app/calculator');
                      }
                    }}
                  >
                    Open Cost Estimator
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* User Message Timestamp */}
          {isUser && (
            <div className="text-[10px] text-forest-200 text-right mt-1.5">
              {message.timestamp}
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-900 flex items-center justify-center shrink-0 border border-forest-200 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
