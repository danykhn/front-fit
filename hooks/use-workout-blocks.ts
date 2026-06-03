'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutBlocksService } from '@/lib/workout-blocks-service';
import type {
  CreateWorkoutBlockPayload,
  UpdateWorkoutBlockPayload,
  QueryWorkoutBlockParams,
} from '@/types';
import type { PaginatedResponse, WorkoutBlock } from '@/types';

export const WORKOUT_BLOCKS_QUERY_KEY = 'workout-blocks';

export function useWorkoutBlocks(params: QueryWorkoutBlockParams = {}) {
  return useQuery<PaginatedResponse<WorkoutBlock>>({
    queryKey: [WORKOUT_BLOCKS_QUERY_KEY, params],
    queryFn: () => workoutBlocksService.findAll(params),
    staleTime: 30_000,
  });
}

export function useWorkoutBlock(id: string) {
  return useQuery<WorkoutBlock>({
    queryKey: [WORKOUT_BLOCKS_QUERY_KEY, id],
    queryFn: () => workoutBlocksService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutBlockPayload) => workoutBlocksService.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [WORKOUT_BLOCKS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['workouts', variables.workoutId] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateWorkoutBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutBlockPayload }) =>
      workoutBlocksService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUT_BLOCKS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteWorkoutBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutBlocksService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUT_BLOCKS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
