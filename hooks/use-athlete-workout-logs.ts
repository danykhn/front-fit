'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutLogsService } from '@/lib/workout-logs-service';
import { useAuthStore } from '@/store/auth-store';
import type {
  CreateWorkoutLogDto,
  UpdateWorkoutLogDto,
  WorkoutLog,
} from '@/types';

export const ATHLETE_WORKOUT_LOGS_QUERY_KEY = 'athlete-workout-logs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(s?: string): boolean {
  return !!s && UUID_REGEX.test(s);
}

export function useAthleteWorkoutLogs(athleteId?: string) {
  const enabled = !!athleteId && isValidUuid(athleteId);
  const token = useAuthStore((state) => state.token);

  const query = useQuery<{ data: WorkoutLog[]; meta: { total: number } }>({
    queryKey: [ATHLETE_WORKOUT_LOGS_QUERY_KEY, athleteId],
    queryFn: () => workoutLogsService.findAll({ page: 1, pageSize: 100 }),
    enabled: enabled && !!token,
    staleTime: 30_000,
  });

  return {
    logs: query.data?.data ?? [],
    total: query.data?.meta.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useCreateWorkoutLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutLogDto) => workoutLogsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATHLETE_WORKOUT_LOGS_QUERY_KEY] });
    },
  });
}

export function useUpdateWorkoutLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutLogDto }) =>
      workoutLogsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATHLETE_WORKOUT_LOGS_QUERY_KEY] });
    },
  });
}

export function useDeleteWorkoutLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutLogsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATHLETE_WORKOUT_LOGS_QUERY_KEY] });
    },
  });
}
