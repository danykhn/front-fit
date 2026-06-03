import api from './api';
import type {
  Exercise,
  CreateExercisePayload,
  UpdateExercisePayload,
  QueryExercisesParams,
  PaginatedResponse,
  SingleExerciseResponse,
} from '@/types';

export const exercisesService = {
  async findAll(params: QueryExercisesParams = {}): Promise<PaginatedResponse<Exercise>> {
    const response = (await api.get('/exercises', { params })) as unknown as PaginatedResponse<Exercise>;
    return response;
  },

  async findOne(id: string): Promise<Exercise> {
    const response = (await api.get(`/exercises/${id}`)) as unknown as SingleExerciseResponse;
    return response.data;
  },

  async create(payload: CreateExercisePayload): Promise<Exercise> {
    const response = (await api.post('/exercises', payload)) as unknown as Exercise;
    return response;
  },

  async update(id: string, payload: UpdateExercisePayload): Promise<Exercise> {
    const response = (await api.patch(`/exercises/${id}`, payload)) as unknown as Exercise;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/exercises/${id}`)) as unknown as { message: string };
    return response;
  },
};
