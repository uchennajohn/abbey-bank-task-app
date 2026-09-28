import { Router } from 'express';
import { postsController } from './posts.controller.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import {
  createPostSchema,
  createCommentSchema,
  getPostsQuerySchema,
} from './posts.schema.js';

export const postsRouter = Router();

postsRouter.get('/', optionalAuth, validateQuery(getPostsQuerySchema), postsController.getPosts);
postsRouter.get('/:id', optionalAuth, postsController.getPostById);
postsRouter.post('/', requireAuth, validateBody(createPostSchema), postsController.createPost);
postsRouter.delete('/:id', requireAuth, postsController.deletePost);

postsRouter.post('/:id/like', requireAuth, postsController.toggleLike);
postsRouter.post('/:id/comments', requireAuth, validateBody(createCommentSchema), postsController.addComment);
postsRouter.delete('/:id/comments/:commentId', requireAuth, postsController.deleteComment);
