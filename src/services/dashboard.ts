import { adaptDashboardResponse } from '@/adapters/dashboardAdapter';
import { fetchDashboard } from '@/services/api';
import type { PeriodType } from '@/types/api';
import type { DashboardPayload } from '@/types/dashboard';

export async function getDashboardPayload(period: PeriodType): Promise<DashboardPayload> {
  const response = await fetchDashboard(period);
  if (!response?.ok) throw new Error('A fonte de dados retornou uma resposta inválida para o dashboard.');
  return adaptDashboardResponse(response);
}
