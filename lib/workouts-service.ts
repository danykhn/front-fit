import api from './api';
import type {
  Workout,
  PaginatedResponse,
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  QueryWorkoutParams,
} from '@/types';

export const workoutsService = {
  async findAll(params: QueryWorkoutParams = {}): Promise<PaginatedResponse<Workout>> {
    const response = (await api.get('/workouts', { params })) as unknown as PaginatedResponse<Workout>;
    return response;
  },

  async findOne(id: string): Promise<Workout> {
    const response = (await api.get(`/workouts/${id}`)) as unknown as Workout;
    return response;
  },

  async create(payload: CreateWorkoutPayload): Promise<Workout> {
    const response = (await api.post('/workouts', payload)) as unknown as Workout;
    return response;
  },

  async update(id: string, payload: UpdateWorkoutPayload): Promise<Workout> {
    const response = (await api.patch(`/workouts/${id}`, payload)) as unknown as Workout;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/workouts/${id}`)) as unknown as { message: string };
    return response;
  },
};
