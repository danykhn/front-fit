import api from './api';
import type {
  SetLog,
  PaginatedResponse,
  CreateSetLogDto,
  UpdateSetLogDto,
  QuerySetLogParams,
} from '@/types';

export const setLogsService = {
  async findAll(params: QuerySetLogParams = {}): Promise<PaginatedResponse<SetLog>> {
    const response = (await api.get('/set-logs', { params })) as unknown as PaginatedResponse<SetLog>;
    return response;
  },

  async findOne(id: string): Promise<SetLog> {
    const response = (await api.get(`/set-logs/${id}`)) as unknown as SetLog;
    return response;
  },

  async create(payload: CreateSetLogDto): Promise<SetLog> {
    const response = (await api.post('/set-logs', payload)) as unknown as SetLog;
    return response;
  },

  async update(id: string, payload: UpdateSetLogDto): Promise<SetLog> {
    const response = (await api.patch(`/set-logs/${id}`, payload)) as unknown as SetLog;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/set-logs/${id}`)) as unknown as { message: string };
    return response;
  },
};
