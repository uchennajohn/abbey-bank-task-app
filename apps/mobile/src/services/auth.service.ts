import { api } from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiSuccessResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },


  async getMe(): Promise<UserResponse> {
    const res = await api.get<ApiSuccessResponse<UserResponse>>('/auth/me');
    return res.data.data;
  },
};
