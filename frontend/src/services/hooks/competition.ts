'use client';

import { useQuery } from '@tanstack/react-query';
import { getEventsApi, getEventByIdApi, getRoundsByEventApi, getCategoriesApi } from '../api/competition';

export function useEventsQuery() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEventsApi,
  });
}

export function useEventByIdQuery(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => getEventByIdApi(eventId),
    enabled: !!eventId,
  });
}

export function useRoundsByEventQuery(eventId: string) {
  return useQuery({
    queryKey: ['rounds', 'event', eventId],
    queryFn: () => getRoundsByEventApi(eventId),
    enabled: !!eventId,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
  });
}
