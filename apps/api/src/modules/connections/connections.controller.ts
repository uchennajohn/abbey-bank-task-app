import type { Response, NextFunction } from 'express';
import { connectionsService } from './connections.service.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type {
  ConnectionResponse,
  UserResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export class ConnectionsController {
  async sendRequest(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<ConnectionResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const requesterId = req.user!.userId;
      const { receiverId } = req.body;
      const connection = await connectionsService.sendRequest(requesterId, receiverId);
      res.status(201).json({
        success: true,
        data: connection,
        message: 'Connection request sent',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<ConnectionResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const { status } = req.body;
      const connection = await connectionsService.updateStatus(id, userId, status);
      res.status(200).json({
        success: true,
        data: connection,
        message: `Connection request ${status.toLowerCase()}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeConnection(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<{ id: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      await connectionsService.removeConnection(id, userId);
      res.status(200).json({
        success: true,
        data: { id },
        message: 'Connection removed',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyConnections(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<UserResponse[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const connections = await connectionsService.getMyConnections(userId);
      res.status(200).json({
        success: true,
        data: connections,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingRequests(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<ConnectionResponse[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const requests = await connectionsService.getPendingRequests(userId);
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSentRequests(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<ConnectionResponse[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const requests = await connectionsService.getSentRequests(userId);
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const connectionsController = new ConnectionsController();
