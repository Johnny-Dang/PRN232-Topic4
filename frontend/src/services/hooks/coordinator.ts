'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdvancementRulesApi, getEliminationsApi, getNotificationsApi } from '../api/coordinator';

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
    queryFn: getNotificationsApi,
  });
}
