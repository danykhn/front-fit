import api from './api';
import type { Trainer, PaginatedResponse } from '@/types';

export const trainersService = {
  async findAll(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<PaginatedResponse<Trainer>> {
    const response = (await api.get('/trainers', { params })) as unknown as PaginatedResponse<Trainer>;
    return response;
  },
};
