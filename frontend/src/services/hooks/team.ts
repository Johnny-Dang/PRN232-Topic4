'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamsApi, getTeamByIdApi, getSubmissionsApi } from '../api/team';

export function useTeamsQuery() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeamsApi,
  });
}

export function useTeamByIdQuery(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => getTeamByIdApi(teamId),
    enabled: !!teamId,
  });
}

export function useSubmissionsQuery() {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: getSubmissionsApi,
  });
}
