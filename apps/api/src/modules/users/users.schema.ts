import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headline: z.string().max(120).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  skills: z.array(z.string()).optional(),
});

export const getUsersQuerySchema = z.object({
  search: z.string().optional(),
  skill: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
