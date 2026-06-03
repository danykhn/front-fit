'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementsService } from '@/lib/measurements-service';
import type {
  CreateMeasurementDto,
  UpdateMeasurementDto,
  QueryMeasurementParams,
} from '@/types';
import type { PaginatedResponse, Measurement } from '@/types';

export const MEASUREMENTS_QUERY_KEY = 'measurements';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(s?: string): boolean {
  return !!s && UUID_REGEX.test(s);
}

export function useMeasurements(params: QueryMeasurementParams = {}) {
  const hasInvalidParam =
    params.athleteId !== undefined && !isValidUuid(params.athleteId);

  return useQuery<PaginatedResponse<Measurement>>({
    queryKey: [MEASUREMENTS_QUERY_KEY, params],
    queryFn: () => measurementsService.findAll(params),
    enabled: !hasInvalidParam,
    staleTime: 30_000,
  });
}

export function useMeasurement(id: string) {
  return useQuery<Measurement>({
    queryKey: [MEASUREMENTS_QUERY_KEY, id],
    queryFn: () => measurementsService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMeasurementDto) => measurementsService.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [MEASUREMENTS_QUERY_KEY] });
      if (variables.athleteId) {
        qc.invalidateQueries({ queryKey: [MEASUREMENTS_QUERY_KEY, { athleteId: variables.athleteId }] });
      }
    },
  });
}

export function useUpdateMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMeasurementDto }) =>
      measurementsService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [MEASUREMENTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [MEASUREMENTS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => measurementsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MEASUREMENTS_QUERY_KEY] });
    },
  });
}
