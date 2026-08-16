import { useQuery } from '@tanstack/react-query';
import { usePeriod } from '@/context/PeriodContext';
import { getDashboardPayload } from '@/services/dashboard';

export function useDashboard() {
  const { period } = usePeriod();
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => getDashboardPayload(period),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
