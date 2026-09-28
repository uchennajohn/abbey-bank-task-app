import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '@techies-social/shared';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle common business logic / service errors
  if (err.message && err.message !== 'Internal server error') {
    const statusCode =
      err.message.toLowerCase().includes('not found') ? 404 :
      err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('invalid email or password') ? 401 :
      err.message.toLowerCase().includes('already exists') ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export const notFoundHandler = (_req: Request, res: Response<ApiErrorResponse>) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
};
