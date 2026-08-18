import type {
  ApiErrorBody,
  HealthResponse,
  HistoryResponse,
  MaintenanceGetResponse,
  MaintenanceRecord,
  MaintenanceManagementResponse,
  MaintenanceImportResponse,
  MaintenanceCycleRequest,
  DashboardApiResponse,
  PeriodType,
  RackRecord,
  RacksGetResponse,
  SaveResponse,
} from '@/types/api';
import type { AdminCreateUserResponse, AdminResetPasswordResponse, AdminUpdateUserResponse, AdminUsersResponse, ChangePasswordResponse, LoginResponse, LogoutResponse, MeResponse } from '@/types/auth';
import { getAccessToken, notifyAuthExpired } from '@/lib/authStorage';

export const DATA_API_BASE_URL = (
  import.meta.env.VITE_DATA_API_BASE_URL ||
  'https://ancar-n8n.gpfgqx.easypanel.host/webhook/claro-rjo-am'
).replace(/\/$/, '');


export type ReportPdfType = 'daily' | 'weekly' | 'monthly';

const REPORT_PDF_PATHS: Record<ReportPdfType, string> = {
  daily: '/report-daily-pdf',
  weekly: '/report-weekly-pdf',
  monthly: '/report-monthly-pdf',
};

const REPORT_PDF_FALLBACK_NAMES: Record<ReportPdfType, string> = {
  daily: 'CLARO_DC-RJO-AM_Relatorio_Diario.pdf',
  weekly: 'CLARO_DC-RJO-AM_Relatorio_Semanal.pdf',
  monthly: 'CLARO_DC-RJO-AM_Relatorio_Mensal.pdf',
};

function reportFilenameFromHeaders(response: Response, type: ReportPdfType) {
  const disposition = response.headers.get('content-disposition') || '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim()).replace(/[\/\\]/g, '-');
    } catch {
      // Usa a próxima estratégia de nome.
    }
  }

  const quotedMatch = disposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1].replace(/[\/\\]/g, '-');

  const plainMatch = disposition.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) return plainMatch[1].trim().replace(/^['"]|['"]$/g, '').replace(/[\/\\]/g, '-');

  return REPORT_PDF_FALLBACK_NAMES[type];
}

async function reportErrorMessage(response: Response) {
  const fallback = safeServiceMessage(undefined, response.status);
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const parsed = JSON.parse(text) as ApiErrorBody;
      return safeServiceMessage(parsed.message || parsed.error, response.status);
    } catch {
      return fallback;
    }
  } catch {
    return fallback;
  }
}

/**
 * Gera o PDF sob demanda e dispara o download imediatamente.
 * O arquivo não entra no React Query, localStorage, sessionStorage, IndexedDB
 * nem em qualquer cache da aplicação. O Blob existe apenas durante o disparo
 * nativo do download e o Object URL é revogado logo em seguida.
 */
export async function downloadReportPdf(type: ReportPdfType): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new ApiError('O download do relatório está disponível somente no navegador.', 0, 'BROWSER_REQUIRED');
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 180000);
  const token = getAccessToken();

  try {
    const response = await fetch(`${DATA_API_BASE_URL}${REPORT_PDF_PATHS[type]}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) notifyAuthExpired();
      throw new ApiError(await reportErrorMessage(response), response.status, 'REPORT_DOWNLOAD_FAILED');
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/pdf')) {
      throw new ApiError('A geração do relatório não retornou um arquivo PDF válido.', response.status, 'INVALID_PDF_RESPONSE');
    }

    const blob = await response.blob();
    if (!blob.size) {
      throw new ApiError('O relatório foi gerado sem conteúdo.', response.status, 'EMPTY_PDF');
    }

    const filename = reportFilenameFromHeaders(response, type);
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('A geração do relatório excedeu o tempo limite.', 0, 'REPORT_TIMEOUT');
    }
    throw new ApiError('Não foi possível gerar e baixar o relatório.', 0, 'REPORT_NETWORK_ERROR');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

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

export async function apiRequest<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${DATA_API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body && !(typeof FormData !== 'undefined' && init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
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



export function fetchMaintenanceManagement(cycle: MaintenanceCycleRequest = 'latest') {
  return apiRequest<MaintenanceManagementResponse>(`/maintenance-data?cycle=${encodeURIComponent(String(cycle))}`);
}

export function importMaintenanceWorkbook(file: File) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  return apiRequest<MaintenanceImportResponse>('/maintenance-import', {
    method: 'POST',
    body: formData,
  }, 60000);
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
