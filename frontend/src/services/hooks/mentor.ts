'use client';

import { useQuery } from '@tanstack/react-query';
import { getCategoryMentorsApi } from '../api/mentor';

export function useCategoryMentorsQuery() {
  return useQuery({
    queryKey: ['categoryMentors'],
    queryFn: getCategoryMentorsApi,
  });
}
