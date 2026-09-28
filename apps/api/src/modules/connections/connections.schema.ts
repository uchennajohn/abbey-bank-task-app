import { z } from 'zod';
import { ConnectionStatus } from '@techies-social/shared';

export const sendConnectionSchema = z.object({
  receiverId: z.string().min(1, 'receiverId is required'),
});

export const updateConnectionStatusSchema = z.object({
  status: z.enum([ConnectionStatus.ACCEPTED, ConnectionStatus.REJECTED]),
});

export type SendConnectionInput = z.infer<typeof sendConnectionSchema>;
export type UpdateConnectionStatusInput = z.infer<typeof updateConnectionStatusSchema>;
