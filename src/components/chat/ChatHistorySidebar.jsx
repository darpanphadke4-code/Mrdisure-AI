// src/components/chat/ChatHistorySidebar.jsx
import React from 'react';
import { Button } from '../common/Button';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const ChatHistorySidebar = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onClearSession,
}) => {
  return (
    <div className="w-64 bg-white border-r border-borderGray flex flex-col h-full shrink-0">
      {/* New Chat Button */}
      <div className="p-4 border-b border-borderGray">
        <Button
          variant="primary"
          size="sm"
          className="w-full text-xs"
          leftIcon={Plus}
          onClick={onNewSession}
        >
          New Inquiry Session
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider">
          Previous Inquiries
        </div>
        {sessions.map((sess) => {
          const isActive = sess.id === activeSessionId;

          return (
            <div
              key={sess.id}
              onClick={() => onSelectSession(sess.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                isActive
                  ? 'bg-forest-100/70 text-forest-900 font-semibold border border-forest-200 shadow-sm'
                  : 'text-charcoal-600 hover:bg-forest-50/50 hover:text-charcoal-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-forest-700' : 'text-charcoal-400'
                  }`}
                />
                <div className="truncate">
                  <div className="truncate">{sess.title}</div>
                  <div className="text-[10px] text-charcoal-400 font-normal">
                    {formatRelativeTime(sess.createdAt)}
                  </div>
                </div>
              </div>

              {isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSession(sess.id);
                  }}
                  className="p-1 text-charcoal-400 hover:text-rose-600 rounded transition-colors opacity-70 hover:opacity-100"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Advisory Note at bottom */}
      <div className="p-3 border-t border-borderGray bg-warmWhite/60 text-[10px] text-charcoal-400 leading-tight">
        Responses cite verified clauses. Always verify against official policy schedule.
      </div>
    </div>
  );
};
