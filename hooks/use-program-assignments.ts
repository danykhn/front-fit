'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programAssignmentsService } from '@/lib/program-assignments-service';
import type {
  CreateProgramAssignmentPayload,
  UpdateProgramAssignmentPayload,
  QueryProgramAssignmentParams,
} from '@/types';
import type { PaginatedResponse, ProgramAssignment } from '@/types';

export const PROGRAM_ASSIGNMENTS_QUERY_KEY = 'program-assignments';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(s?: string): boolean {
  return !!s && UUID_REGEX.test(s);
}

export function useProgramAssignments(params: QueryProgramAssignmentParams = {}) {
  // Si llegan IDs vacíos o inválidos, no disparamos el fetch
  const hasInvalidParam =
    (params.programId !== undefined && !isValidUuid(params.programId)) ||
    (params.athleteId !== undefined && !isValidUuid(params.athleteId));

  return useQuery<PaginatedResponse<ProgramAssignment>>({
    queryKey: [PROGRAM_ASSIGNMENTS_QUERY_KEY, params],
    queryFn: () => programAssignmentsService.findAll(params),
    enabled: !hasInvalidParam,
    staleTime: 30_000,
  });
}

export function useCreateProgramAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgramAssignmentPayload) =>
      programAssignmentsService.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [PROGRAM_ASSIGNMENTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['programs', variables.programId] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateProgramAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProgramAssignmentPayload }) =>
      programAssignmentsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRAM_ASSIGNMENTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteProgramAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programAssignmentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROGRAM_ASSIGNMENTS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
