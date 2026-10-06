// src/services/authService.js
import { initialUser } from '../data/mockUser';

const USER_KEY = 'medisure_user_profile';

export const authService = {
  /**
   * Get simulated logged in user
   */
  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load user', e);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(initialUser));
    return initialUser;
  },

  /**
   * Update profile or preferences
   */
  updateUser: (updates) => {
    const current = authService.getUser();
    const updated = {
      ...current,
      ...updates,
      preferences: {
        ...current.preferences,
        ...(updates.preferences || {}),
      }
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Reset user and clear demo data
   */
  clearAllDemoData: () => {
    localStorage.removeItem('medisure_policies');
    localStorage.removeItem('medisure_chat_sessions');
    localStorage.removeItem('medisure_reports');
    localStorage.removeItem(USER_KEY);
  }
};
