'use client';

import { useQuery } from '@tanstack/react-query';
import { getScoresApi, getJudgeAssignmentsApi } from '../api/judge';

export function useScoresQuery() {
  return useQuery({
    queryKey: ['scores'],
    queryFn: getScoresApi,
  });
}

export function useJudgeAssignmentsQuery() {
  return useQuery({
    queryKey: ['judgeAssignments'],
    queryFn: getJudgeAssignmentsApi,
  });
}
