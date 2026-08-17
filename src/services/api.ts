import type {
  ApiErrorBody,
  HealthResponse,
  HistoryResponse,
  MaintenanceGetResponse,
  MaintenanceRecord,
  DashboardApiResponse,
  PeriodType,
  RackRecord,
  RacksGetResponse,
  ReportResponse,
  SaveResponse,
} from '@/types/api';
import type { AdminCreateUserResponse, AdminResetPasswordResponse, AdminUpdateUserResponse, AdminUsersResponse, ChangePasswordResponse, LoginResponse, LogoutResponse, MeResponse } from '@/types/auth';
import { getAccessToken, notifyAuthExpired } from '@/lib/authStorage';

export const DATA_API_BASE_URL = (
  import.meta.env.VITE_DATA_API_BASE_URL ||
  'https://ancar-n8n.gpfgqx.easypanel.host/webhook/claro-rjo-am'
).replace(/\/$/, '');


function safeServiceMessage(message: string | undefined, status: number) {
  const fallback = status === 503
    ? 'Os dados ainda não estão disponíveis para a seleção atual.'
    : status === 404
      ? 'Nenhum dado foi encontrado para a seleção atual.'
      : status >= 500
        ? 'Não foi possível concluir a consulta de dados.'
        : 'Não foi possível concluir a solicitação.';

  if (!message) return fallback;
  if (/\b(n8n|redis|webhook|workflow|backend)\b/i.test(message)) return fallback;
  return message;
}

export class ApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${DATA_API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        ...(init?.headers || {}),
      },
    });

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new ApiError(`Resposta inválida da fonte de dados (${response.status}).`, response.status, 'INVALID_JSON');
      }
    }

    if (!response.ok) {
      const errorBody = (body || {}) as ApiErrorBody;
      if (response.status === 401) notifyAuthExpired();
      throw new ApiError(
        safeServiceMessage(errorBody.message || errorBody.error, response.status),
        response.status,
        errorBody.error,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tempo limite excedido ao consultar a fonte de dados.', 0, 'TIMEOUT');
    }
    throw new ApiError('Não foi possível conectar à fonte de dados.', 0, 'NETWORK_ERROR');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function fetchDashboard(period: PeriodType) {
  return apiRequest<DashboardApiResponse>(`/dashboard?period=${period}`);
}

export function fetchHistory() {
  return apiRequest<HistoryResponse>('/history');
}

export function fetchHealth() {
  return apiRequest<HealthResponse>('/health');
}

export function fetchRacks(competence: string) {
  return apiRequest<RacksGetResponse>(`/racks?competence=${encodeURIComponent(competence)}`);
}

export function saveRacks(payload: {
  competence: string;
  responsible?: string;
  locations: Array<{
    location: string;
    total_positions: number;
    occupied_positions: number;
    notes?: string;
  }>;
  notes?: string;
}) {
  return apiRequest<SaveResponse<RackRecord>>('/racks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMaintenance(competence: string) {
  return apiRequest<MaintenanceGetResponse>(`/maintenance?competence=${encodeURIComponent(competence)}`);
}

export function saveMaintenance(payload: {
  competence: string;
  responsible?: string;
  planned: number;
  completed: number;
  notes?: string;
}) {
  return apiRequest<SaveResponse<MaintenanceRecord>>('/maintenance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchReport(period: PeriodType) {
  return apiRequest<ReportResponse>(`/report?period=${period}`);
}


export function loginAccess(username: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function fetchCurrentAccess() {
  return apiRequest<MeResponse>('/auth/me');
}

export function logoutAccess() {
  return apiRequest<LogoutResponse>('/auth/logout', { method: 'POST' });
}

export function changeAccessPassword(currentPassword: string, newPassword: string) {
  return apiRequest<ChangePasswordResponse>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}


export function fetchAdminUsers() {
  return apiRequest<AdminUsersResponse>('/auth/admin-users');
}

export function createAdminUser(payload: { username: string; display_name: string; role: 'ADMIN' | 'VIEWER' }) {
  return apiRequest<AdminCreateUserResponse>('/auth/admin-create-user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminUser(payload: { user_id: string; display_name: string; role: 'ADMIN' | 'VIEWER'; active: boolean }) {
  return apiRequest<AdminUpdateUserResponse>('/auth/admin-update-user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetAdminUserPassword(userId: string) {
  return apiRequest<AdminResetPasswordResponse>('/auth/admin-reset-password', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}
