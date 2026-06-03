import api from './api';
import type { Athlete, PaginatedResponse, CreateAthletePayload, UpdateAthletePayload, QueryAthletesParams } from '@/types';

export const athletesService = {
  async findAll(params: QueryAthletesParams = {}): Promise<PaginatedResponse<Athlete>> {
    const response = (await api.get('/athletes', { params })) as unknown as PaginatedResponse<Athlete>;
    return response;
  },

  async findOne(id: string): Promise<Athlete> {
    const response = (await api.get(`/athletes/${id}`)) as unknown as Athlete;
    return response;
  },

  async create(payload: CreateAthletePayload): Promise<Athlete> {
    const response = (await api.post('/athletes', payload)) as unknown as Athlete;
    return response;
  },

  async update(id: string, payload: UpdateAthletePayload): Promise<Athlete> {
    const response = (await api.patch(`/athletes/${id}`, payload)) as unknown as Athlete;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/athletes/${id}`)) as unknown as { message: string };
    return response;
  },
};
