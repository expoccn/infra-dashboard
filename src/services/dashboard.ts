import { dashboardPayload } from '@/data/mockDashboardPayload';
import type { DashboardPayload } from '@/types/dashboard';

export async function getDashboardPayload(): Promise<DashboardPayload> {
  return dashboardPayload;
}
