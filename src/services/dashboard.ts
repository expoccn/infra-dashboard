import { adaptDashboardResponse } from '@/adapters/dashboardAdapter';
import { fetchDashboard } from '@/services/api';
import type { PeriodType } from '@/types/api';
import type { DashboardPayload } from '@/types/dashboard';

export async function getDashboardPayload(period: PeriodType): Promise<DashboardPayload> {
  const response = await fetchDashboard(period);
  if (!response?.ok) throw new Error('Backend retornou payload de dashboard inválido.');
  return adaptDashboardResponse(response);
}
