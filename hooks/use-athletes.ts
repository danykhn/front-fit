'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { athletesService } from '@/lib/athletes-service';
import type { Athlete, CreateAthletePayload, QueryAthletesParams, UpdateAthletePayload } from '@/types';
import type { PaginatedResponse } from '@/types';

export const ATHLETES_QUERY_KEY = 'athletes';

export function useAthletes(params: QueryAthletesParams = {}) {
  return useQuery<PaginatedResponse<Athlete>>({
    queryKey: [ATHLETES_QUERY_KEY, params],
    queryFn: () => athletesService.findAll(params),
    staleTime: 30_000,
  });
}

export function useAthlete(id: string) {
  return useQuery<Athlete>({
    queryKey: [ATHLETES_QUERY_KEY, id],
    queryFn: () => athletesService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAthletePayload) => athletesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATHLETES_QUERY_KEY] });
    },
  });
}

export function useUpdateAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAthletePayload }) =>
      athletesService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [ATHLETES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [ATHLETES_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => athletesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATHLETES_QUERY_KEY] });
    },
  });
}
