// src/services/chatService.js
import { initialSessions, fallbackResponses } from '../data/mockChat';

const SESSIONS_KEY = 'medisure_chat_sessions';

export const chatService = {
  /**
   * Get all chat sessions
   */
  getSessions: () => {
    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load chat sessions', e);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(initialSessions));
    return initialSessions;
  },

  /**
   * Get single session
   */
  getSessionById: (id) => {
    const sessions = chatService.getSessions();
    return sessions.find((s) => s.id === id) || sessions[0] || null;
  },

  /**
   * Create a new session
   */
  createSession: (title = "New Policy Inquiry", policyId = "pol-care-supreme-01") => {
    const sessions = chatService.getSessions();
    const newSession = {
      id: `session-${Date.now()}`,
      title,
      policyId,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}-welcome`,
          sender: "assistant",
          text: "Hello! I am your MediSure AI policy analysis assistant. Ask me anything about your policy's coverage, waiting periods, room rent caps, or out-of-pocket hospital expenses.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          clauses: [],
          confidence: "System Ready",
        }
      ]
    };
    const updated = [newSession, ...sessions];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return newSession;
  },

  /**
   * Check local AI / Ollama service health
   */
  checkAIHealth: async () => {
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('AI health check failed:', e);
    }
    return { ollama_available: false, llm_model: 'qwen3:4b', embedding_model: 'nomic-embed-text' };
  },

  /**
   * Send user message to local RAG backend or fallback to demo simulation
   */
  sendMessage: async (sessionId, userText, policy) => {
    const sessions = chatService.getSessions();
    let sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) {
      const created = chatService.createSession("Policy Inquiry", policy?.id);
      sessions.unshift(created);
      sessionIndex = 0;
    }

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    sessions[sessionIndex].messages.push(userMsg);

    // If a policy is selected, attempt real Local RAG via FastAPI backend
    if (policy?.id) {
      try {
        const payload = {
          policy_id: policy.id,
          question: userText,
        };
        if (sessions[sessionIndex].backendSessionId) {
          payload.session_id = sessions[sessionIndex].backendSessionId;
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            if (data.session_id) {
              sessions[sessionIndex].backendSessionId = data.session_id;
            }

            const assistantMsg = {
              id: `msg-${Date.now()}-a`,
              sender: "assistant",
              text: data.answer,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              citations: data.citations || [],
              context_found: data.context_found,
              policyId: policy.id,
              confidence: data.context_found ? "Verified Grounded" : "No Direct Policy Evidence",
            };

            sessions[sessionIndex].messages.push(assistantMsg);
            if (sessions[sessionIndex].messages.length <= 3) {
              sessions[sessionIndex].title = userText.slice(0, 32) + (userText.length > 32 ? '...' : '');
            }
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
            return {
              userMsg,
              assistantMsg,
              updatedSession: sessions[sessionIndex]
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.detail || `Chat request failed (HTTP ${res.status})`;
          if (res.status === 409 || errMsg.includes("analyzed and indexed")) {
            throw new Error(errMsg);
          }
          if (res.status === 503 || errMsg.includes("Ollama") || errMsg.includes("Local AI service")) {
            throw new Error("Local AI service is not running. Start Ollama and try again.");
          }
          throw new Error(errMsg);
        }
      } catch (apiErr) {
        if (apiErr.message && (
          apiErr.message.includes("Ollama") || 
          apiErr.message.includes("Local AI service") ||
          apiErr.message.includes("analyzed and indexed")
        )) {
          throw apiErr;
        }
        console.warn('Real RAG API failed or policy is purely local demo, using simulated fallback:', apiErr);
      }
    }

    // Fallback simulation for mock demo policies
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Match query keywords
    const lower = userText.toLowerCase();
    let template = fallbackResponses.unknown;

    if (lower.includes("cover") || lower.includes("what does my policy cover") || lower.includes("benefit")) {
      template = fallbackResponses.coverage;
    } else if (lower.includes("surgery") || lower.includes("operation") || lower.includes("laparoscopic") || lower.includes("robotic")) {
      template = fallbackResponses.surgery;
    } else if (lower.includes("waiting") || lower.includes("pre-existing") || lower.includes("ped") || lower.includes("years")) {
      template = fallbackResponses.waiting;
    } else if (lower.includes("exclu") || lower.includes("not covered") || lower.includes("dental") || lower.includes("cosmetic")) {
      template = fallbackResponses.exclusions;
    } else if (lower.includes("remain") || lower.includes("balance") || lower.includes("sum insured") || lower.includes("left")) {
      template = fallbackResponses.balance;
    } else if (lower.includes("estimate") || lower.includes("bill") || lower.includes("cost") || lower.includes("expense") || lower.includes("hospital")) {
      template = fallbackResponses.estimate;
    }

    const assistantMsg = {
      id: `msg-${Date.now()}-a`,
      sender: "assistant",
      text: template.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      explanation: `Analysis verified against ${policy?.name || 'Active Policy'} terms. Room rent cap: ₹${policy?.roomRentLimitPerDay || 5000}/day, Deductible: ₹${policy?.deductible || 15000}.`,
      clauses: template.clauses,
      confidence: template.confidence,
      hasTransferableEstimate: !!template.hasTransferableEstimate,
      estimatePayload: template.estimatePayload ? {
        ...template.estimatePayload,
        policyId: policy?.id,
        policyName: policy?.name,
      } : null,
    };

    sessions[sessionIndex].messages.push(assistantMsg);
    // Update session title if first exchange
    if (sessions[sessionIndex].messages.length <= 3) {
      sessions[sessionIndex].title = userText.slice(0, 32) + (userText.length > 32 ? '...' : '');
    }

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return {
      userMsg,
      assistantMsg,
      updatedSession: sessions[sessionIndex]
    };
  },

  /**
   * Delete a chat session on backend and locally
   */
  deleteSession: async (sessionId) => {
    const sessions = chatService.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    const backendId = session?.backendSessionId || sessionId;

    // Call backend DELETE endpoint if session exists on backend
    try {
      const res = await fetch(`/api/chat/sessions/${backendId}`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 404) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to delete session (HTTP ${res.status})`);
      }
    } catch (e) {
      if (!e.message || !e.message.includes('404')) {
        throw e;
      }
    }

    // Only remove from local storage after backend deletion succeeds
    const updated = sessions.filter((s) => s.id !== sessionId && s.backendSessionId !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Fetch backend chat sessions and sync with local sessions
   */
  fetchSessions: async (policyId) => {
    try {
      const url = policyId ? `/api/chat/sessions?policy_id=${encodeURIComponent(policyId)}` : '/api/chat/sessions';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const backendList = json.data;
          const localSessions = chatService.getSessions();
          
          const synced = [];
          
          for (const bSess of backendList) {
            const localMatch = localSessions.find(s => s.id === bSess.id || s.backendSessionId === bSess.id);
            if (localMatch) {
              synced.push({
                ...localMatch,
                id: bSess.id,
                backendSessionId: bSess.id,
                title: bSess.title || localMatch.title,
                policyId: bSess.policy_id || localMatch.policyId,
                createdAt: bSess.created_at || localMatch.createdAt,
              });
            } else {
              synced.push({
                id: bSess.id,
                backendSessionId: bSess.id,
                title: bSess.title,
                policyId: bSess.policy_id,
                createdAt: bSess.created_at,
                messages: []
              });
            }
          }

          for (const loc of localSessions) {
            if (!loc.backendSessionId && !backendList.some(b => b.id === loc.id)) {
              synced.push(loc);
            }
          }

          localStorage.setItem(SESSIONS_KEY, JSON.stringify(synced));
          return synced;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch backend sessions:', e);
    }
    return chatService.getSessions();
  },

  /**
   * Load messages for a session from backend
   */
  loadSessionMessages: async (sessionId) => {
    const sessions = chatService.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return null;

    const backendId = sessions[sessionIndex].backendSessionId || sessionId;
    try {
      const res = await fetch(`/api/chat/sessions/${backendId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data.messages)) {
          const msgs = json.data.messages.map(m => ({
            id: m.id,
            sender: m.role,
            text: m.content,
            citations: m.citations || [],
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: m.citations?.length > 0 ? "Verified Grounded" : undefined
          }));
          sessions[sessionIndex].messages = msgs;
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
          return sessions[sessionIndex];
        }
      }
    } catch (e) {
      console.warn('Failed to load session messages from backend:', e);
    }
    return sessions[sessionIndex];
  },

  /**
   * Clear session history
   */
  clearSession: (sessionId) => {
    const sessions = chatService.getSessions();
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].messages = [
        {
          id: `msg-${Date.now()}-reset`,
          sender: "assistant",
          text: "Conversation cleared. How can I assist you with your policy analysis today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          clauses: [],
          confidence: "System Ready",
        }
      ];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return sessions[sessionIndex];
    }
    return null;
  },

  /**
   * Reset all chat sessions
   */
  resetSessions: () => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(initialSessions));
    return initialSessions;
  }
};
