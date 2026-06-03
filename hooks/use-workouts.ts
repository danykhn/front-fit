'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsService } from '@/lib/workouts-service';
import type {
  Workout,
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  QueryWorkoutParams,
} from '@/types';
import type { PaginatedResponse } from '@/types';

export const WORKOUTS_QUERY_KEY = 'workouts';

export function useWorkouts(params: QueryWorkoutParams = {}) {
  return useQuery<PaginatedResponse<Workout>>({
    queryKey: [WORKOUTS_QUERY_KEY, params],
    queryFn: () => workoutsService.findAll(params),
    staleTime: 30_000,
  });
}

export function useWorkout(id: string) {
  return useQuery<Workout>({
    queryKey: [WORKOUTS_QUERY_KEY, id],
    queryFn: () => workoutsService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutPayload) => workoutsService.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [WORKOUTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['programs', variables.programId] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutPayload }) =>
      workoutsService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [WORKOUTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [WORKOUTS_QUERY_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
