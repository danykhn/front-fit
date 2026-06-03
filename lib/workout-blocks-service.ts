import api from './api';
import type {
  WorkoutBlock,
  PaginatedResponse,
  CreateWorkoutBlockPayload,
  UpdateWorkoutBlockPayload,
  QueryWorkoutBlockParams,
} from '@/types';

export const workoutBlocksService = {
  async findAll(
    params: QueryWorkoutBlockParams = {},
  ): Promise<PaginatedResponse<WorkoutBlock>> {
    const response = (await api.get('/workout-blocks', { params })) as unknown as PaginatedResponse<WorkoutBlock>;
    return response;
  },

  async findOne(id: string): Promise<WorkoutBlock> {
    const response = (await api.get(`/workout-blocks/${id}`)) as unknown as WorkoutBlock;
    return response;
  },

  async create(payload: CreateWorkoutBlockPayload): Promise<WorkoutBlock> {
    const response = (await api.post('/workout-blocks', payload)) as unknown as WorkoutBlock;
    return response;
  },

  async update(id: string, payload: UpdateWorkoutBlockPayload): Promise<WorkoutBlock> {
    const response = (await api.patch(`/workout-blocks/${id}`, payload)) as unknown as WorkoutBlock;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/workout-blocks/${id}`)) as unknown as { message: string };
    return response;
  },
};
