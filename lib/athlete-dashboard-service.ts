import api from './api';
import type {
  Program,
  ProgramAssignment,
  Workout,
  WorkoutLog,
  PaginatedResponse,
} from '@/types';

export interface AthleteProgramResponse {
  assignment: ProgramAssignment;
  program: Program;
}

export interface AthleteTodayWorkout {
  weekNumber: number;
  program: Program;
  workout: Workout | null;
  isRestDay: boolean;
}

export interface AthleteStats {
  totalWorkouts: number;
  currentStreak: number;
  thisWeekMinutes: number;
  thisWeekCompleted: number;
  thisWeekTotal: number;
}

/**
 * Servicio del dashboard del atleta.
 * Compone datos de varios endpoints para alimentar la vista principal.
 */
export const athleteDashboardService = {
  /**
   * Devuelve la asignación activa del atleta con su programa.
   */
  async getActiveAssignment(): Promise<AthleteProgramResponse | null> {
    const res = (await api.get('/program-assignments', {
      params: { isActive: true, page: 1, pageSize: 1 },
    })) as unknown as PaginatedResponse<ProgramAssignment>;

    const assignment = res.data[0];
    if (!assignment) return null;

    const program = (await api.get(`/programs/${assignment.programId}`)) as unknown as Program;

    return { assignment, program };
  },

  /**
   * Devuelve el workout de hoy, basado en la asignación activa y el día actual de la semana.
   * Usa los workouts ya incluidos en el programa (no hace una llamada extra).
   */
  async getTodayWorkout(
    assignment: ProgramAssignment,
    program: Program,
  ): Promise<AthleteTodayWorkout> {
    const startDate = new Date(assignment.startDate);
    const today = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const elapsedWeeks = Math.floor((today.getTime() - startDate.getTime()) / msPerWeek);
    const weekNumber = Math.min(Math.max(elapsedWeeks + 1, 1), program.totalWeeks);
    const todayDayNumber = today.getDay() === 0 ? 7 : today.getDay();

    const todayWorkout =
      program.workouts?.find((w) => w.dayNumber === todayDayNumber) ?? null;

    return {
      weekNumber,
      program,
      workout: todayWorkout,
      isRestDay: !todayWorkout || todayWorkout.dayType === 'DESCANSO',
    };
  },

  /**
   * Devuelve los últimos N registros de sesión del atleta.
   * Internamente pide 100 (max del backend) y filtra los N más recientes.
   */
  async getRecentLogs(limit = 5): Promise<WorkoutLog[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const res = (await api.get('/workout-logs', {
      params: { page: 1, pageSize: 100 },
    })) as unknown as PaginatedResponse<WorkoutLog>;
    return res.data.slice(0, safeLimit);
  },

  /**
   * Devuelve los logs de la semana actual (lunes-domingo).
   */
  async getThisWeekLogs(): Promise<WorkoutLog[]> {
    const res = (await api.get('/workout-logs', {
      params: { page: 1, pageSize: 100 },
    })) as unknown as PaginatedResponse<WorkoutLog>;

    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const mondayTs = monday.getTime();

    return res.data.filter((log) => new Date(log.date).getTime() >= mondayTs);
  },

  /**
   * Devuelve los logs de los últimos `days` días (para streak).
   * Limitado a 100 registros (max permitido por el backend).
   */
  async getLogsInLastDays(days: number): Promise<WorkoutLog[]> {
    const res = await this.getRecentLogs(100);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    const cutoffTs = cutoff.getTime();

    return res.filter((log) => new Date(log.date).getTime() >= cutoffTs);
  },

  /**
   * Devuelve el total histórico de registros del atleta (vía `meta.total`).
   */
  async getTotalLogsCount(): Promise<number> {
    const res = (await api.get('/workout-logs', {
      params: { page: 1, pageSize: 1 },
    })) as unknown as PaginatedResponse<WorkoutLog>;
    return res.meta.total;
  },

  /**
   * Calcula estadísticas del atleta a partir de sus logs.
   */
  async getStats(): Promise<AthleteStats> {
    const [recent, thisWeek, totalWorkouts] = await Promise.all([
      this.getLogsInLastDays(60),
      this.getThisWeekLogs(),
      this.getTotalLogsCount(),
    ]);

    const thisWeekMinutes = thisWeek.reduce((acc, l) => acc + (l.durationMin ?? 0), 0);
    const thisWeekCompleted = thisWeek.length;

    const completedDays = new Set(
      recent.map((l) => new Date(l.date).toISOString().slice(0, 10)),
    );

    let currentStreak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (currentStreak < 365) {
      const iso = cursor.toISOString().slice(0, 10);
      if (completedDays.has(iso)) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        if (currentStreak === 0) {
          cursor.setDate(cursor.getDate() - 1);
          const yesterdayIso = cursor.toISOString().slice(0, 10);
          if (!completedDays.has(yesterdayIso)) {
            break;
          }
        } else {
          break;
        }
      }
    }

    return {
      totalWorkouts,
      currentStreak,
      thisWeekMinutes,
      thisWeekCompleted,
      thisWeekTotal: 0,
    };
  },
};
