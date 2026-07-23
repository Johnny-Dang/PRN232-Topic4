'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdvancementRulesApi, getEliminationsApi, getNotificationsApi, markAllNotificationsAsReadApi, markNotificationAsReadApi, createTestNotificationApi } from '../api/coordinator';

export function useAdvancementRulesQuery() {
  return useQuery({
    queryKey: ['advancementRules'],
    queryFn: getAdvancementRulesApi,
  });
}

export function useEliminationsQuery() {
  return useQuery({
    queryKey: ['eliminations'],
    queryFn: getEliminationsApi,
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const result = await getNotificationsApi();
        console.log("[useNotificationsQuery] Result:", result);
        return result;
      } catch (error) {
        console.error("[useNotificationsQuery] Error:", error);
        return [];
      }
    },
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string | number) => markNotificationAsReadApi(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsReadApi(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCreateTestNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message?: string) => createTestNotificationApi(message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
