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
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Bot,
  Sparkles,
  RotateCcw,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
  History,
  Shield,
  AlertCircle,
  CheckCircle2,
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
    : selectedPolicy || policies[0];

  const [sessions, setSessions] = useState(() => chatService.getSessions());
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const list = chatService.getSessions();
    return list[0]?.id || 'session-1';
  });
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showRightContext, setShowRightContext] = useState(true);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [aiHealth, setAiHealth] = useState({ ollama_available: true, llm_model: 'qwen3:4b' });

  const messagesEndRef = useRef(null);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isTyping]);

  // Check Ollama AI health on mount
  useEffect(() => {
    chatService.checkAIHealth().then((health) => {
      setAiHealth(health);
    });
  }, []);

  // Sync sessions with backend on mount or policy change
  useEffect(() => {
    let isMounted = true;
    chatService.fetchSessions(activePolicy?.id).then((synced) => {
      if (isMounted && Array.isArray(synced) && synced.length > 0) {
        setSessions(synced);
        if (!synced.some((s) => s.id === activeSessionId)) {
          setActiveSessionId(synced[0].id);
        }
      }
    });
    return () => { isMounted = false; };
  }, [activePolicy?.id]);

  // Select session and lazy-load messages if needed
  const handleSelectSession = async (id) => {
    setActiveSessionId(id);
    const sess = sessions.find((s) => s.id === id);
    if (sess && (!sess.messages || sess.messages.length === 0)) {
      const updated = await chatService.loadSessionMessages(id);
      if (updated) {
        setSessions(chatService.getSessions());
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    if (!activePolicy) {
      toast.error('Please upload or select a policy before asking questions');
      return;
    }

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
      const errText = e.message || 'Failed to get assistant response';
      toast.error(errText);
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

  // Delete session with modal confirmation and backend removal
  const handleDeleteSessionClick = (sessionId) => {
    setSessionToDelete(sessionId);
  };

  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeletingSession(true);
    try {
      await chatService.deleteSession(sessionToDelete);
      const updatedList = chatService.getSessions();
      setSessions(updatedList);
      toast.success('Conversation deleted successfully');

      if (activeSessionId === sessionToDelete) {
        if (updatedList.length > 0) {
          setActiveSessionId(updatedList[0].id);
        } else {
          const newSess = chatService.createSession('New Inquiry Session', activePolicy?.id);
          setSessions([newSess]);
          setActiveSessionId(newSess.id);
        }
      }
    } catch (e) {
      console.error('Failed to delete session:', e);
      toast.error(e.message || 'Failed to delete conversation');
    } finally {
      setIsDeletingSession(false);
      setSessionToDelete(null);
    }
  };

  // Transfer estimate payload to Cost Estimator
  const handleTransferEstimate = (payload) => {
    toast.success('Transferring policy deduction limits to Cost Estimator...');
    navigate('/app/calculator', { state: { fromChat: payload } });
  };

  // Empty State if no policies uploaded
  if (!policies || policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-8rem)] bg-white rounded-2xl border border-borderGray shadow-subtle">
        <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4 border border-forest-100 shadow-subtle">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-forest-900 font-heading mb-1">
          No Policies Available
        </h3>
        <p className="text-xs text-charcoal-500 max-w-sm mb-6">
          Upload a policy to start asking questions.
        </p>
        <Button variant="primary" onClick={() => navigate('/app/policies')}>
          Upload Policy
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-borderGray shadow-subtle flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Left History Sidebar (Desktop & Mobile Drawer) */}
      <div className="hidden md:block">
        <ChatHistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSessionClick}
          isDeletingSessionId={isDeletingSession ? sessionToDelete : null}
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
              handleSelectSession(id);
              setShowMobileHistory(false);
            }}
            onNewSession={() => {
              handleNewSession();
              setShowMobileHistory(false);
            }}
            onDeleteSession={(id) => {
              handleDeleteSessionClick(id);
              setShowMobileHistory(false);
            }}
            isDeletingSessionId={isDeletingSession ? sessionToDelete : null}
          />
        </div>
      )}

      {/* Central Conversation Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-warmWhite/30 h-full">
        {/* Chat Header Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-borderGray bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setShowMobileHistory(true)}
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-forest-900 md:hidden shrink-0"
              title="View Inquiry History"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-charcoal-500 font-medium">
                  Answering questions about:
                </span>
                <select
                  value={activePolicy?.id || ''}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setSelectedPolicyId(chosenId);
                    navigate(`/app/assistant?policyId=${chosenId}`);
                  }}
                  className="text-xs font-bold text-forest-900 bg-forest-50 border border-forest-200 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiHealth.ollama_available ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Local Qwen3 Ready
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Ollama Offline
              </span>
            )}

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

        {/* Ollama Offline Warning Banner */}
        {!aiHealth.ollama_available && (
          <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between px-4 shrink-0">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Local AI service is not running. Start Ollama and try again.</span>
            </span>
            <span className="text-[11px] font-mono text-amber-800">ollama serve</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {/* Welcome disclaimer bubble */}
          <div className="mx-auto max-w-lg p-3 bg-forest-50/70 border border-forest-100 rounded-xl text-center text-xs text-charcoal-600 mb-4">
            <span className="font-bold text-forest-900 block font-heading mb-0.5">
              Local Policy Intelligence (Qwen3 & RAG)
            </span>
            <span>Ask questions regarding waiting periods, room rent sub-limits, surgery coverage, or exclusions. Answers are strictly grounded in policy text with source page citations.</span>
          </div>

          {currentSession?.messages?.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onTransferEstimate={handleTransferEstimate}
              currentPolicyId={activePolicy?.id}
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
                  Retrieving relevant policy clauses & analyzing evidence with Qwen3...
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
      {showRightContext && activePolicy && (
        <div className="hidden lg:block">
          <PolicyContextPanel
            policy={activePolicy}
            onSelectPolicy={(id) => {
              setSelectedPolicyId(id);
              navigate(`/app/assistant?policyId=${id}`);
            }}
          />
        </div>
      )}

      {/* Confirmation Dialog for Permanent Session Deletion */}
      <ConfirmDialog
        isOpen={!!sessionToDelete}
        onClose={() => !isDeletingSession && setSessionToDelete(null)}
        onConfirm={handleConfirmDeleteSession}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? All messages and citations in this consultation will be permanently removed from the database. The underlying insurance policy and documents will not be affected."
        confirmText="Delete Conversation"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeletingSession}
      />
    </div>
  );
};
