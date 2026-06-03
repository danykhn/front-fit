import api from './api';
import type {
  Program,
  PaginatedResponse,
  CreateProgramPayload,
  UpdateProgramPayload,
  QueryProgramParams,
} from '@/types';

export const programsService = {
  async findAll(params: QueryProgramParams = {}): Promise<PaginatedResponse<Program>> {
    const response = (await api.get('/programs', { params })) as unknown as PaginatedResponse<Program>;
    return response;
  },

  async findOne(id: string): Promise<Program> {
    const response = (await api.get(`/programs/${id}`)) as unknown as Program;
    return response;
  },

  async create(payload: CreateProgramPayload): Promise<Program> {
    const response = (await api.post('/programs', payload)) as unknown as Program;
    return response;
  },

  async update(id: string, payload: UpdateProgramPayload): Promise<Program> {
    const response = (await api.patch(`/programs/${id}`, payload)) as unknown as Program;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/programs/${id}`)) as unknown as { message: string };
    return response;
  },

  async duplicate(id: string): Promise<Program> {
    const response = (await api.post(`/programs/${id}/duplicate`)) as unknown as Program;
    return response;
  },
};
