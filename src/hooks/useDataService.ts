import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchHealth,
  fetchHistory,
  fetchMaintenance,
  fetchMaintenanceManagement,
  importMaintenanceWorkbook,
  fetchRacks,
  saveMaintenance,
  saveRacks,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
  downloadReport,
  askAi,
  fetchAiHistory,
  clearAiHistory,
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



export function useMaintenanceManagement(cycle: 'latest' | 'all' | number = 'latest') {
  return useQuery({
    queryKey: ['maintenance-management', cycle],
    queryFn: () => fetchMaintenanceManagement(cycle),
    staleTime: 60 * 1000,
    retry: 1,
    placeholderData: (previous) => previous,
  });
}

export function useImportMaintenanceWorkbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importMaintenanceWorkbook,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance-management'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });
}



export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useResetAdminUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetAdminUserPassword,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: downloadReport,
  });
}

export function useAiHistory(sessionId: string) {
  return useQuery({
    queryKey: ['ai-history', sessionId],
    queryFn: () => fetchAiHistory(sessionId),
    enabled: /^[A-Za-z0-9._-]{8,96}$/.test(sessionId),
    staleTime: 0,
    retry: 1,
  });
}

export function useAskAi() {
  return useMutation({
    mutationFn: askAi,
  });
}

export function useClearAiHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAiHistory,
    onSuccess: async (result) => {
      queryClient.setQueryData(['ai-history', result.session_id], {
        ok: true,
        action: 'history',
        session_id: result.session_id,
        history: [],
      });
    },
  });
}

