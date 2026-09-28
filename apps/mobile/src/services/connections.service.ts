import { api } from './api';
import type {
  ConnectionResponse,
  UserResponse,
  ConnectionStatus,
  ApiSuccessResponse,
} from '@techies-social/shared';

export const connectionsApi = {
  async getMyConnections(): Promise<UserResponse[]> {
    const res = await api.get<ApiSuccessResponse<UserResponse[]>>('/connections');
    return res.data.data;
  },

  async getPendingRequests(): Promise<ConnectionResponse[]> {
    const res = await api.get<ApiSuccessResponse<ConnectionResponse[]>>('/connections/requests/pending');
    return res.data.data;
  },

  async getSentRequests(): Promise<ConnectionResponse[]> {
    const res = await api.get<ApiSuccessResponse<ConnectionResponse[]>>('/connections/requests/sent');
    return res.data.data;
  },

  async sendRequest(receiverId: string): Promise<ConnectionResponse> {
    const res = await api.post<ApiSuccessResponse<ConnectionResponse>>('/connections', {
      receiverId,
    });
    return res.data.data;
  },

  async updateStatus(
    connectionId: string,
    status: ConnectionStatus.ACCEPTED | ConnectionStatus.REJECTED
  ): Promise<ConnectionResponse> {
    const res = await api.patch<ApiSuccessResponse<ConnectionResponse>>(
      `/connections/${connectionId}`,
      { status }
    );
    return res.data.data;
  },

  async removeConnection(connectionId: string): Promise<void> {
    await api.delete(`/connections/${connectionId}`);
  },
};
