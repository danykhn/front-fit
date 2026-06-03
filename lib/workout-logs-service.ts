import api from './api';
import type {
  WorkoutLog,
  PaginatedResponse,
  CreateWorkoutLogDto,
  UpdateWorkoutLogDto,
  QueryWorkoutLogParams,
} from '@/types';

export const workoutLogsService = {
  async findAll(params: QueryWorkoutLogParams = {}): Promise<PaginatedResponse<WorkoutLog>> {
    const response = (await api.get('/workout-logs', { params })) as unknown as PaginatedResponse<WorkoutLog>;
    return response;
  },

  async findOne(id: string): Promise<WorkoutLog> {
    const response = (await api.get(`/workout-logs/${id}`)) as unknown as WorkoutLog;
    return response;
  },

  async create(payload: CreateWorkoutLogDto): Promise<WorkoutLog> {
    const response = (await api.post('/workout-logs', payload)) as unknown as WorkoutLog;
    return response;
  },

  async update(id: string, payload: UpdateWorkoutLogDto): Promise<WorkoutLog> {
    const response = (await api.patch(`/workout-logs/${id}`, payload)) as unknown as WorkoutLog;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/workout-logs/${id}`)) as unknown as { message: string };
    return response;
  },
};
