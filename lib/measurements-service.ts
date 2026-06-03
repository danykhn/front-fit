import api from './api';
import type {
  Measurement,
  PaginatedResponse,
  CreateMeasurementDto,
  UpdateMeasurementDto,
  QueryMeasurementParams,
} from '@/types';

export const measurementsService = {
  async findAll(
    params: QueryMeasurementParams = {},
  ): Promise<PaginatedResponse<Measurement>> {
    const response = (await api.get('/measurements', { params })) as unknown as PaginatedResponse<Measurement>;
    return response;
  },

  async findOne(id: string): Promise<Measurement> {
    const response = (await api.get(`/measurements/${id}`)) as unknown as Measurement;
    return response;
  },

  async create(payload: CreateMeasurementDto): Promise<Measurement> {
    const response = (await api.post('/measurements', payload)) as unknown as Measurement;
    return response;
  },

  async update(id: string, payload: UpdateMeasurementDto): Promise<Measurement> {
    const response = (await api.patch(`/measurements/${id}`, payload)) as unknown as Measurement;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/measurements/${id}`)) as unknown as { message: string };
    return response;
  },
};
