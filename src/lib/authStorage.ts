const SESSION_KEY = 'claro-rjo-am-access-session';
export const AUTH_EXPIRED_EVENT = 'claro-rjo-am-auth-expired';

export function getAccessToken() {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(SESSION_KEY) || '';
  } catch {
    return '';
  }
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, token);
  } catch {
    // A sessão permanece apenas em memória caso o storage do navegador esteja bloqueado.
  }
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Sem ação adicional necessária.
  }
}

export function notifyAuthExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
