/**
 * Generate or retrieve a persistent session ID for anonymous user tracking
 * Uses localStorage to persist across page reloads
 * Falls back to sessionStorage if localStorage is not available
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = "unevent_session_id";

  // Try localStorage first (persists across browser sessions)
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        return existing;
      }

      // Generate new session ID
      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);
      return sessionId;
    } catch (e) {
      // localStorage might be disabled, fall through to sessionStorage
    }
  }

  // Fallback to sessionStorage (only persists for current browser session)
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const existing = sessionStorage.getItem(STORAGE_KEY);
      if (existing) {
        return existing;
      }

      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem(STORAGE_KEY, sessionId);
      return sessionId;
    } catch (e) {
      // sessionStorage also disabled, generate ephemeral ID
    }
  }

  // Last resort: generate ephemeral ID (won't persist)
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
