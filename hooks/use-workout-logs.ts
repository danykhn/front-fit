'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutLogsService } from '@/lib/workout-logs-service';
import type {
  CreateWorkoutLogDto,
  UpdateWorkoutLogDto,
  QueryWorkoutLogParams,
} from '@/types';
import type { PaginatedResponse, WorkoutLog } from '@/types';

export const WORKOUT_LOGS_QUERY_KEY = 'workout-logs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(s?: string): boolean {
  return !!s && UUID_REGEX.test(s);
}

export function useWorkoutLogs(params: QueryWorkoutLogParams = {}) {
  const hasInvalidParam =
    (params.athleteId !== undefined && !isValidUuid(params.athleteId)) ||
    (params.workoutId !== undefined && !isValidUuid(params.workoutId));

  return useQuery<PaginatedResponse<WorkoutLog>>({
    queryKey: [WORKOUT_LOGS_QUERY_KEY, params],
    queryFn: () => workoutLogsService.findAll(params),
    enabled: !hasInvalidParam,
    staleTime: 30_000,
  });
}

export function useWorkoutLog(id: string) {
  return useQuery<WorkoutLog>({
    queryKey: [WORKOUT_LOGS_QUERY_KEY, id],
    queryFn: () => workoutLogsService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutLogDto) => workoutLogsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUT_LOGS_QUERY_KEY] });
    },
  });
}

export function useUpdateWorkoutLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutLogDto }) =>
      workoutLogsService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [WORKOUT_LOGS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [WORKOUT_LOGS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteWorkoutLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutLogsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WORKOUT_LOGS_QUERY_KEY] });
    },
  });
}
