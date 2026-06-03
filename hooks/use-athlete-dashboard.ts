'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { athleteDashboardService } from '@/lib/athlete-dashboard-service';
import type {
  AthleteProgramResponse,
  AthleteTodayWorkout,
  AthleteStats,
} from '@/lib/athlete-dashboard-service';
import type { WorkoutLog } from '@/types';

export const ATHLETE_DASHBOARD_QUERY_KEY = 'athlete-dashboard';

/**
 * Hook principal del dashboard del atleta.
 * Carga en cascada: asignación → workout de hoy + stats + logs recientes.
 */
export function useAthleteDashboard(athleteId?: string) {
  const enabled = !!athleteId;

  const assignmentQuery = useQuery<AthleteProgramResponse | null>({
    queryKey: [ATHLETE_DASHBOARD_QUERY_KEY, 'active-assignment', athleteId],
    queryFn: () => athleteDashboardService.getActiveAssignment(),
    enabled,
    staleTime: 30_000,
  });

  const statsQuery = useQuery<AthleteStats>({
    queryKey: [ATHLETE_DASHBOARD_QUERY_KEY, 'stats', athleteId],
    queryFn: () => athleteDashboardService.getStats(),
    enabled,
    staleTime: 30_000,
  });

  const recentLogsQuery = useQuery<WorkoutLog[]>({
    queryKey: [ATHLETE_DASHBOARD_QUERY_KEY, 'recent-logs', athleteId],
    queryFn: () => athleteDashboardService.getRecentLogs(5),
    enabled,
    staleTime: 30_000,
  });

  const todayQuery = useQuery<AthleteTodayWorkout | null>({
    queryKey: [
      ATHLETE_DASHBOARD_QUERY_KEY,
      'today',
      assignmentQuery.data?.program.id,
    ],
    queryFn: async () => {
      if (!assignmentQuery.data) return null;
      return athleteDashboardService.getTodayWorkout(
        assignmentQuery.data.assignment,
        assignmentQuery.data.program,
      );
    },
    enabled: enabled && !!assignmentQuery.data,
    staleTime: 30_000,
  });

  return {
    assignment: assignmentQuery.data,
    today: todayQuery.data,
    stats: statsQuery.data,
    recentLogs: recentLogsQuery.data,
    isLoading:
      assignmentQuery.isLoading ||
      statsQuery.isLoading ||
      recentLogsQuery.isLoading,
    isLoadingToday: todayQuery.isLoading,
    error:
      assignmentQuery.error ||
      statsQuery.error ||
      recentLogsQuery.error ||
      todayQuery.error,
  };
}

/**
 * Invalida toda la cache del dashboard del atleta.
 * Llamar al crear un workout log o asignación.
 */
export function useInvalidateAthleteDashboard() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [ATHLETE_DASHBOARD_QUERY_KEY] });
  };
}
