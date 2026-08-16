import type {
  ApiErrorBody,
  HealthResponse,
  HistoryResponse,
  MaintenanceGetResponse,
  MaintenanceRecord,
  N8nDashboardResponse,
  PeriodType,
  RackRecord,
  RacksGetResponse,
  ReportResponse,
  SaveResponse,
} from '@/types/api';

export const N8N_WEBHOOK_BASE_URL = (
  import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ||
  'https://ancar-n8n.gpfgqx.easypanel.host/webhook/claro-rjo-am'
).replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${N8N_WEBHOOK_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
      },
    });

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new ApiError(`Resposta inválida do backend (${response.status}).`, response.status, 'INVALID_JSON');
      }
    }

    if (!response.ok) {
      const errorBody = (body || {}) as ApiErrorBody;
      throw new ApiError(
        errorBody.message || errorBody.error || `Falha HTTP ${response.status}`,
        response.status,
        errorBody.error,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tempo limite excedido ao consultar o backend n8n.', 0, 'TIMEOUT');
    }
    throw new ApiError('Não foi possível conectar ao backend n8n.', 0, 'NETWORK_ERROR');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function fetchDashboard(period: PeriodType) {
  return apiRequest<N8nDashboardResponse>(`/dashboard?period=${period}`);
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
