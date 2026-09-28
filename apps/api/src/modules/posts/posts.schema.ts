import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(3000, 'Post is too long'),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

export const getPostsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  authorId: z.string().optional(),
  feedType: z.enum(['all', 'connections']).default('all'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type GetPostsQueryInput = z.infer<typeof getPostsQuerySchema>;
