const AI_SESSION_STORAGE_KEY = 'claro-rjo-am-ai-session-v1';
const SESSION_PATTERN = /^[A-Za-z0-9._-]{8,96}$/;

function newSessionId() {
  const random = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  return `ai-${random}`.slice(0, 96);
}

export function getOrCreateAiSessionId() {
  if (typeof window === 'undefined') return '';

  const current = window.sessionStorage.getItem(AI_SESSION_STORAGE_KEY) || '';
  if (SESSION_PATTERN.test(current)) return current;

  const sessionId = newSessionId();
  window.sessionStorage.setItem(AI_SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}
