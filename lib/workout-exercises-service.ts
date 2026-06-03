import api from './api';
import type {
  WorkoutExercise,
  PaginatedResponse,
  CreateWorkoutExercisePayload,
  UpdateWorkoutExercisePayload,
  QueryWorkoutExerciseParams,
} from '@/types';

export const workoutExercisesService = {
  async findAll(
    params: QueryWorkoutExerciseParams = {},
  ): Promise<PaginatedResponse<WorkoutExercise>> {
    const response = (await api.get('/workout-exercises', { params })) as unknown as PaginatedResponse<WorkoutExercise>;
    return response;
  },

  async findOne(id: string): Promise<WorkoutExercise> {
    const response = (await api.get(`/workout-exercises/${id}`)) as unknown as WorkoutExercise;
    return response;
  },

  async create(payload: CreateWorkoutExercisePayload): Promise<WorkoutExercise> {
    const response = (await api.post('/workout-exercises', payload)) as unknown as WorkoutExercise;
    return response;
  },

  async update(id: string, payload: UpdateWorkoutExercisePayload): Promise<WorkoutExercise> {
    const response = (await api.patch(`/workout-exercises/${id}`, payload)) as unknown as WorkoutExercise;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/workout-exercises/${id}`)) as unknown as { message: string };
    return response;
  },
};
