// src/components/chat/ChatSuggestions.jsx
import React from 'react';
import { promptSuggestions } from '../../data/mockChat';
import { Sparkles } from 'lucide-react';

export const ChatSuggestions = ({ onSelectPrompt, disabled }) => {
  return (
    <div className="py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5 text-forest-600" />
        <span>Suggested Policy Inquiries</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {promptSuggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.text)}
            className="px-3 py-1.5 rounded-xl bg-white border border-borderGray hover:border-forest-400 hover:bg-forest-50/60 text-xs font-medium text-charcoal-700 hover:text-forest-900 transition-all text-left shadow-subtle disabled:opacity-50"
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
};
