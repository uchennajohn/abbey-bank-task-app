import type { Response, NextFunction } from 'express';
import { postsService } from './posts.service.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type {
  PostResponse,
  CommentResponse,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export class PostsController {
  async createPost(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<PostResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const authorId = req.user!.userId;
      const post = await postsService.createPost(authorId, req.body);
      res.status(201).json({
        success: true,
        data: post,
        message: 'Post published successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<PaginatedResponse<PostResponse>>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const posts = await postsService.getPosts(currentUserId, req.query as any);
      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<PostResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user?.userId;
      const post = await postsService.getPostById(id, currentUserId);
      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<{ id: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      await postsService.deletePost(id, userId);
      res.status(200).json({
        success: true,
        data: { id },
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<{ isLiked: boolean; likesCount: number }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const result = await postsService.toggleLike(id, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addComment(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<CommentResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const authorId = req.user!.userId;
      const comment = await postsService.addComment(id, authorId, req.body);
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(
    req: AuthenticatedRequest,
    res: Response<ApiSuccessResponse<{ id: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = req.params.commentId as string;
      const userId = req.user!.userId;
      await postsService.deleteComment(commentId, userId);
      res.status(200).json({
        success: true,
        data: { id: commentId },
        message: 'Comment deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postsController = new PostsController();
