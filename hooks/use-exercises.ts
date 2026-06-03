'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exercisesService } from '@/lib/exercises-service';
import type {
  Exercise,
  CreateExercisePayload,
  QueryExercisesParams,
  UpdateExercisePayload,
} from '@/types';
import type { PaginatedResponse } from '@/types';

export const EXERCISES_QUERY_KEY = 'exercises';

export function useExercises(params: QueryExercisesParams = {}) {
  return useQuery<PaginatedResponse<Exercise>>({
    queryKey: [EXERCISES_QUERY_KEY, params],
    queryFn: () => exercisesService.findAll(params),
    staleTime: 60_000, // 1 min
  });
}

export function useExercise(id: string) {
  return useQuery<Exercise>({
    queryKey: [EXERCISES_QUERY_KEY, id],
    queryFn: () => exercisesService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExercisePayload) => exercisesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
  });
}

export function useUpdateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExercisePayload }) =>
      exercisesService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exercisesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
  });
}
