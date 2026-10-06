// src/components/chat/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export const ChatInput = ({ onSendMessage, isLoading, placeholder }) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  return (
    <form onSubmit={handleSubmit} className="relative bg-white border border-borderGray rounded-2xl shadow-subtle focus-within:border-forest-500 focus-within:ring-1 focus-within:ring-forest-500/20 transition-all p-2 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        rows={1}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Ask about room limits, ICU charges, exclusions, or claim steps..."}
        disabled={isLoading}
        className="flex-1 max-h-32 p-2 bg-transparent text-xs sm:text-sm text-charcoal-800 placeholder-charcoal-400 focus:outline-none resize-none leading-relaxed"
      />

      <button
        type="submit"
        disabled={!inputText.trim() || isLoading}
        className="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shrink-0 hover:bg-forest-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  );
};
