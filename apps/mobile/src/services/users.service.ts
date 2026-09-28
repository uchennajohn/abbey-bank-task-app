import { api } from './api';
import type {
  UserResponse,
  UpdateProfileRequest,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export interface GetUsersParams {
  search?: string;
  skill?: string;
  page?: number;
  limit?: number;
}

export const usersApi = {
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<UserResponse>> {
    const res = await api.get<ApiSuccessResponse<PaginatedResponse<UserResponse>>>('/users', {
      params,
    });
    return res.data.data;
  },

  async getUserById(id: string): Promise<UserResponse> {
    const res = await api.get<ApiSuccessResponse<UserResponse>>(`/users/${id}`);
    return res.data.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const res = await api.put<ApiSuccessResponse<UserResponse>>('/users/profile', data);
    return res.data.data;
  },
};
