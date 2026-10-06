// src/pages/AssistantPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePolicy } from '../context/PolicyContext';
import { chatService } from '../services/chatService';
import { ChatHistorySidebar } from '../components/chat/ChatHistorySidebar';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatSuggestions } from '../components/chat/ChatSuggestions';
import { ChatInput } from '../components/chat/ChatInput';
import { PolicyContextPanel } from '../components/chat/PolicyContextPanel';
import { Button } from '../components/common/Button';
import {
  Bot,
  Sparkles,
  RotateCcw,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
  History,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AssistantPage = () => {
  const [searchParams] = useSearchParams();
  const queryPolicyId = searchParams.get('policyId');
  const navigate = useNavigate();

  const { policies, selectedPolicy, setSelectedPolicyId, addActivity } = usePolicy();

  // Pick policy from query param or context
  const activePolicy = queryPolicyId
    ? policies.find((p) => p.id === queryPolicyId) || selectedPolicy
    : selectedPolicy;

  const [sessions, setSessions] = useState(() => chatService.getSessions());
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const list = chatService.getSessions();
    return list[0]?.id || 'session-1';
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showRightContext, setShowRightContext] = useState(true);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const messagesEndRef = useRef(null);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);

  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(activeSessionId, text, activePolicy);
      const updatedList = chatService.getSessions();
      setSessions(updatedList);
      addActivity({
        type: 'chat',
        title: 'AI Policy Assistant Consultation',
        description: `Queried: "${text.slice(0, 40)}..."`,
        policyName: activePolicy?.name,
      });
    } catch (e) {
      toast.error('Failed to get assistant response');
    } finally {
      setIsTyping(false);
    }
  };

  // Create new inquiry session
  const handleNewSession = () => {
    const newSess = chatService.createSession('New Inquiry Session', activePolicy?.id);
    const updated = chatService.getSessions();
    setSessions(updated);
    setActiveSessionId(newSess.id);
    toast.success('Started new inquiry session');
  };

  // Clear current session messages
  const handleClearSession = (sessionId) => {
    chatService.clearSession(sessionId);
    setSessions(chatService.getSessions());
    toast.success('Conversation cleared');
  };

  // Transfer estimate payload to Cost Estimator
  const handleTransferEstimate = (payload) => {
    toast.success('Transferring policy deduction limits to Cost Estimator...');
    navigate('/app/calculator', { state: { fromChat: payload } });
  };

  return (
    <div className="bg-white rounded-2xl border border-borderGray shadow-subtle flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Left History Sidebar (Desktop & Mobile Drawer) */}
      <div className="hidden md:block">
        <ChatHistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id)}
          onNewSession={handleNewSession}
          onClearSession={handleClearSession}
        />
      </div>

      {/* Mobile History Backdrop */}
      {showMobileHistory && (
        <div
          className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMobileHistory(false)}
        />
      )}
      {showMobileHistory && (
        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white md:hidden shadow-elevated">
          <ChatHistorySidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setShowMobileHistory(false);
            }}
            onNewSession={() => {
              handleNewSession();
              setShowMobileHistory(false);
            }}
            onClearSession={(id) => {
              handleClearSession(id);
              setShowMobileHistory(false);
            }}
          />
        </div>
      )}

      {/* Central Conversation Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-warmWhite/30 h-full">
        {/* Chat Header Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-borderGray bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowMobileHistory(true)}
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-forest-900 md:hidden"
              title="View Inquiry History"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-forest-900 font-heading truncate max-w-[200px] sm:max-w-xs">
                {currentSession?.title || 'Policy Analysis Assistant'}
              </h3>
              <p className="text-[10px] text-charcoal-400">
                Verified against: <strong>{activePolicy?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleClearSession(activeSessionId)}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Clear current conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRightContext(!showRightContext)}
              className="hidden lg:flex p-1.5 rounded-lg text-charcoal-500 hover:text-forest-900 hover:bg-forest-50 transition-colors"
              title={showRightContext ? 'Hide Policy Context' : 'Show Policy Context'}
            >
              {showRightContext ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {/* Welcome disclaimer bubble */}
          <div className="mx-auto max-w-lg p-3 bg-forest-50/70 border border-forest-100 rounded-xl text-center text-xs text-charcoal-600 mb-4">
            <span className="font-bold text-forest-900 block font-heading mb-0.5">
              MediSure Policy Intelligence Prototype
            </span>
            <span>Ask questions regarding waiting periods, room rent sub-limits, surgery coverage, or non-medical consumables.</span>
          </div>

          {currentSession?.messages?.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onTransferEstimate={handleTransferEstimate}
            />
          ))}

          {/* Assistant Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 my-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-forest-700 text-white flex items-center justify-center shrink-0 shadow-subtle">
                <Bot className="w-4 h-4 text-softTeal" />
              </div>
              <div className="p-3.5 bg-white border border-borderGray rounded-2xl rounded-tl-none shadow-subtle flex items-center gap-1.5 text-xs text-charcoal-400">
                <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 font-medium text-forest-800">
                  Scanning policy clauses & schedule...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions & Input Area */}
        <div className="p-4 border-t border-borderGray bg-white shrink-0 space-y-3">
          <ChatSuggestions
            onSelectPrompt={handleSendMessage}
            disabled={isTyping}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isTyping}
            placeholder={`Ask about ${activePolicy?.name || 'policy'} limits, ICU, room caps...`}
          />
        </div>
      </div>

      {/* Right Policy Context Panel on Large Screens */}
      {showRightContext && (
        <div className="hidden lg:block">
          <PolicyContextPanel
            policy={activePolicy}
            onSelectPolicy={(id) => setSelectedPolicyId(id)}
          />
        </div>
      )}
    </div>
  );
};
