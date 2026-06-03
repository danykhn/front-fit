'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutExercisesService } from '@/lib/workout-exercises-service';
import type {
  CreateWorkoutExercisePayload,
  UpdateWorkoutExercisePayload,
  QueryWorkoutExerciseParams,
} from '@/types';
import type { PaginatedResponse, WorkoutExercise } from '@/types';

export const WORKOUT_EXERCISES_QUERY_KEY = 'workout-exercises';

export function useWorkoutExercises(params: QueryWorkoutExerciseParams = {}) {
  return useQuery<PaginatedResponse<WorkoutExercise>>({
    queryKey: [WORKOUT_EXERCISES_QUERY_KEY, params],
    queryFn: () => workoutExercisesService.findAll(params),
    staleTime: 30_000,
  });
}

export function useWorkoutExercise(id: string) {
  return useQuery<WorkoutExercise>({
    queryKey: [WORKOUT_EXERCISES_QUERY_KEY, id],
    queryFn: () => workoutExercisesService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutExercisePayload) => workoutExercisesService.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [WORKOUT_EXERCISES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['workout-blocks'] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateWorkoutExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutExercisePayload }) =>
      workoutExercisesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUT_EXERCISES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkoutExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutExercisesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUT_EXERCISES_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
