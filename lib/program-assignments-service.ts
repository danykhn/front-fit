import api from './api';
import type {
  ProgramAssignment,
  PaginatedResponse,
  CreateProgramAssignmentPayload,
  UpdateProgramAssignmentPayload,
  QueryProgramAssignmentParams,
} from '@/types';

export const programAssignmentsService = {
  async findAll(
    params: QueryProgramAssignmentParams = {},
  ): Promise<PaginatedResponse<ProgramAssignment>> {
    const response = (await api.get('/program-assignments', { params })) as unknown as PaginatedResponse<ProgramAssignment>;
    return response;
  },

  async findOne(id: string): Promise<ProgramAssignment> {
    const response = (await api.get(`/program-assignments/${id}`)) as unknown as ProgramAssignment;
    return response;
  },

  async create(payload: CreateProgramAssignmentPayload): Promise<ProgramAssignment> {
    const response = (await api.post('/program-assignments', payload)) as unknown as ProgramAssignment;
    return response;
  },

  async update(id: string, payload: UpdateProgramAssignmentPayload): Promise<ProgramAssignment> {
    const response = (await api.patch(`/program-assignments/${id}`, payload)) as unknown as ProgramAssignment;
    return response;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = (await api.delete(`/program-assignments/${id}`)) as unknown as { message: string };
    return response;
  },
};
