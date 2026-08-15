import { useQuery } from '@tanstack/react-query';
import { getDashboardPayload } from '@/services/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-latest'],
    queryFn: getDashboardPayload,
    staleTime: 5 * 60 * 1000,
  });
}
