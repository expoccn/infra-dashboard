import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePeriod } from '@/context/PeriodContext';
import {
  fetchHealth,
  fetchHistory,
  fetchMaintenance,
  fetchRacks,
  fetchReport,
  saveMaintenance,
  saveRacks,
} from '@/services/api';

export function useHealth() {
  return useQuery({
    queryKey: ['data-health'],
    queryFn: fetchHealth,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ['dashboard-history'],
    queryFn: fetchHistory,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useRacks(competence: string) {
  return useQuery({
    queryKey: ['racks', competence],
    queryFn: () => fetchRacks(competence),
    enabled: /^\d{4}-\d{2}$/.test(competence),
    retry: 1,
  });
}

export function useSaveRacks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRacks,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['racks', result.data.competence] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
}

export function useMaintenance(competence: string) {
  return useQuery({
    queryKey: ['maintenance', competence],
    queryFn: () => fetchMaintenance(competence),
    enabled: /^\d{4}-\d{2}$/.test(competence),
    retry: 1,
  });
}

export function useSaveMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMaintenance,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance', result.data.competence] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
}

export function useReport() {
  const { period } = usePeriod();
  return useQuery({
    queryKey: ['report', period],
    queryFn: () => fetchReport(period),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
