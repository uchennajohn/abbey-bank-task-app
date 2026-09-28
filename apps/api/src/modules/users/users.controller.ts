import type { Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type {
  UserResponse,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export class UsersController {
  async getUsers(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<PaginatedResponse<UserResponse>>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const result = await usersService.getUsers(currentUserId, req.query as any);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<UserResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const targetUserId = req.params.id as string;
      const currentUserId = req.user?.userId;
      const user = await usersService.getUserById(targetUserId, currentUserId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<UserResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await usersService.updateProfile(userId, req.body);
      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
