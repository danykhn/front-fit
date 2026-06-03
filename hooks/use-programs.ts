'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsService } from '@/lib/programs-service';
import type {
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
  QueryProgramParams,
} from '@/types';
import type { PaginatedResponse } from '@/types';

export const PROGRAMS_QUERY_KEY = 'programs';

export function usePrograms(params: QueryProgramParams = {}) {
  return useQuery<PaginatedResponse<Program>>({
    queryKey: [PROGRAMS_QUERY_KEY, params],
    queryFn: () => programsService.findAll(params),
    staleTime: 30_000,
  });
}

export function useProgram(id: string) {
  return useQuery<Program>({
    queryKey: [PROGRAMS_QUERY_KEY, id],
    queryFn: () => programsService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgramPayload) => programsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
    },
  });
}

export function useUpdateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProgramPayload }) =>
      programsService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
    },
  });
}

export function useDuplicateProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programsService.duplicate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
    },
  });
}
