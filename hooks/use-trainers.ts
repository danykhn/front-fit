'use client';

import { useQuery } from '@tanstack/react-query';
import { trainersService } from '@/lib/trainers-service';
import type { PaginatedResponse, Trainer } from '@/types';

export const TRAINERS_QUERY_KEY = 'trainers';

export function useTrainers(params: { pageSize?: number; search?: string } = {}) {
  return useQuery<PaginatedResponse<Trainer>>({
    queryKey: [TRAINERS_QUERY_KEY, params],
    queryFn: () => trainersService.findAll({ pageSize: 100, ...params }),
    staleTime: 60_000,
  });
}
