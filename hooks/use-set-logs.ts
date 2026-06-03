'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { setLogsService } from '@/lib/set-logs-service';
import type {
  CreateSetLogDto,
  UpdateSetLogDto,
  QuerySetLogParams,
} from '@/types';
import type { PaginatedResponse, SetLog } from '@/types';

export const SET_LOGS_QUERY_KEY = 'set-logs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(s?: string): boolean {
  return !!s && UUID_REGEX.test(s);
}

export function useSetLogs(params: QuerySetLogParams = {}) {
  const hasInvalidParam =
    (params.workoutLogId !== undefined && !isValidUuid(params.workoutLogId)) ||
    (params.workoutExerciseId !== undefined && !isValidUuid(params.workoutExerciseId));

  return useQuery<PaginatedResponse<SetLog>>({
    queryKey: [SET_LOGS_QUERY_KEY, params],
    queryFn: () => setLogsService.findAll(params),
    enabled: !hasInvalidParam,
    staleTime: 10_000,
  });
}

export function useSetLogsByWorkoutLog(workoutLogId?: string) {
  return useSetLogs(
    workoutLogId ? { workoutLogId, page: 1, pageSize: 500 } : {},
  );
}

export function useCreateSetLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSetLogDto) => setLogsService.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [SET_LOGS_QUERY_KEY, { workoutLogId: variables.workoutLogId }] });
      qc.invalidateQueries({ queryKey: [SET_LOGS_QUERY_KEY] });
    },
  });
}

export function useUpdateSetLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSetLogDto }) =>
      setLogsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SET_LOGS_QUERY_KEY] });
    },
  });
}

export function useDeleteSetLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setLogsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SET_LOGS_QUERY_KEY] });
    },
  });
}
