import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type {
  AuthResponse,
  UserResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export class AuthController {
  async register(
    req: Request,
    res: Response<ApiSuccessResponse<AuthResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Account registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request,
    res: Response<ApiSuccessResponse<AuthResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Logged in successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<UserResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getMe(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
