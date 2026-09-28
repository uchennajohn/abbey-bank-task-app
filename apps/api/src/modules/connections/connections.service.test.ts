import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionsService } from './connections.service.js';
import { prisma } from '../../lib/prisma.js';
import { ConnectionStatus } from '@techies-social/shared';

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    connection: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('ConnectionsService', () => {
  let connectionsService: ConnectionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    connectionsService = new ConnectionsService();
  });

  it('should prevent user from connecting with themselves', async () => {
    await expect(
      connectionsService.sendRequest('user-1', 'user-1')
    ).rejects.toThrow('You cannot send a connection request to yourself');
  });

  it('should throw error if target receiver does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      connectionsService.sendRequest('user-1', 'user-2')
    ).rejects.toThrow('Target user does not exist');
  });

  it('should send a pending connection request successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-2' } as any);
    vi.mocked(prisma.connection.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.connection.create).mockResolvedValue({
      id: 'conn-1',
      requesterId: 'user-1',
      receiverId: 'user-2',
      status: 'PENDING',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      requester: {
        id: 'user-1',
        name: 'User One',
        email: 'user1@test.com',
        headline: 'Engineer',
        bio: null,
        location: null,
        avatarUrl: null,
        skills: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      receiver: {
        id: 'user-2',
        name: 'User Two',
        email: 'user2@test.com',
        headline: 'Designer',
        bio: null,
        location: null,
        avatarUrl: null,
        skills: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    } as any);

    const result = await connectionsService.sendRequest('user-1', 'user-2');

    expect(result.id).toBe('conn-1');
    expect(result.status).toBe(ConnectionStatus.PENDING);
    expect(result.requester.name).toBe('User One');
    expect(result.receiver.name).toBe('User Two');
  });

  it('should only allow recipient to accept a pending connection', async () => {
    vi.mocked(prisma.connection.findUnique).mockResolvedValue({
      id: 'conn-1',
      requesterId: 'user-1',
      receiverId: 'user-2',
      status: 'PENDING',
    } as any);

    // Requester tries to accept their own request
    await expect(
      connectionsService.updateStatus('conn-1', 'user-1', ConnectionStatus.ACCEPTED)
    ).rejects.toThrow('Only the recipient can respond to this connection request');
  });
});
