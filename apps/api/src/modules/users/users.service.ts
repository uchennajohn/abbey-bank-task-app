import { prisma } from '../../lib/prisma.js';
import type { UpdateProfileInput, GetUsersQueryInput } from './users.schema.js';
import type {
  UserResponse,
  PaginatedResponse,
  ConnectionStatus,
} from '@techies-social/shared';

export class UsersService {
  private formatUser(
    user: {
      id: string;
      name: string;
      email: string;
      headline: string | null;
      bio: string | null;
      location: string | null;
      avatarUrl: string | null;
      skills: string[];
      createdAt: Date;
    },
    connectionMeta?: {
      status: ConnectionStatus | 'NONE' | 'SELF';
      connectionId?: string | null;
      isRequester?: boolean;
    },
    counts?: {
      connectionsCount?: number;
      postsCount?: number;
    }
  ): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
      skills: user.skills,
      connectionStatus: connectionMeta?.status ?? 'NONE',
      connectionId: connectionMeta?.connectionId ?? null,
      isRequester: connectionMeta?.isRequester ?? false,
      connectionsCount: counts?.connectionsCount ?? 0,
      postsCount: counts?.postsCount ?? 0,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getUsers(
    currentUserId: string,
    query: GetUsersQueryInput
  ): Promise<PaginatedResponse<UserResponse>> {
    const { search, skill, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { headline: { contains: search.trim(), mode: 'insensitive' } },
        { bio: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (skill && skill.trim()) {
      where.skills = {
        has: skill.trim(),
      };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sentConnections: {
            where: {
              OR: [{ receiverId: currentUserId }, { requesterId: currentUserId }],
            },
          },
          receivedConnections: {
            where: {
              OR: [{ receiverId: currentUserId }, { requesterId: currentUserId }],
            },
          },
          _count: {
            select: {
              sentConnections: { where: { status: 'ACCEPTED' } },
              receivedConnections: { where: { status: 'ACCEPTED' } },
              posts: true,
            },
          },
        },
      }),
    ]);

    const items: UserResponse[] = users.map((u) => {
      let connectionStatus: ConnectionStatus | 'NONE' | 'SELF' = 'NONE';
      let connectionId: string | null = null;
      let isRequester = false;

      if (u.id === currentUserId) {
        connectionStatus = 'SELF';
      } else {
        const sent = u.sentConnections.find((c) => c.receiverId === currentUserId);
        const received = u.receivedConnections.find((c) => c.requesterId === currentUserId);

        if (sent) {
          connectionStatus = sent.status as ConnectionStatus;
          connectionId = sent.id;
          isRequester = false; // User sent it to me
        } else if (received) {
          connectionStatus = received.status as ConnectionStatus;
          connectionId = received.id;
          isRequester = true; // I sent it to user
        }
      }

      const totalConnections =
        u._count.sentConnections + u._count.receivedConnections;

      return this.formatUser(
        u,
        { status: connectionStatus, connectionId, isRequester },
        { connectionsCount: totalConnections, postsCount: u._count.posts }
      );
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total,
    };
  }

  async getUserById(
    targetUserId: string,
    currentUserId?: string
  ): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        _count: {
          select: {
            sentConnections: { where: { status: 'ACCEPTED' } },
            receivedConnections: { where: { status: 'ACCEPTED' } },
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let connectionStatus: ConnectionStatus | 'NONE' | 'SELF' = 'NONE';
    let connectionId: string | null = null;
    let isRequester = false;

    if (currentUserId) {
      if (currentUserId === targetUserId) {
        connectionStatus = 'SELF';
      } else {
        const connection = await prisma.connection.findFirst({
          where: {
            OR: [
              { requesterId: currentUserId, receiverId: targetUserId },
              { requesterId: targetUserId, receiverId: currentUserId },
            ],
          },
        });

        if (connection) {
          connectionStatus = connection.status as ConnectionStatus;
          connectionId = connection.id;
          isRequester = connection.requesterId === targetUserId; // true = they sent it → current user can accept
        }
      }
    }

    const totalConnections =
      user._count.sentConnections + user._count.receivedConnections;

    return this.formatUser(
      user,
      { status: connectionStatus, connectionId, isRequester },
      { connectionsCount: totalConnections, postsCount: user._count.posts }
    );
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserResponse> {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.headline !== undefined && { headline: input.headline }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
        ...(input.skills !== undefined && { skills: input.skills }),
      },
      include: {
        _count: {
          select: {
            sentConnections: { where: { status: 'ACCEPTED' } },
            receivedConnections: { where: { status: 'ACCEPTED' } },
            posts: true,
          },
        },
      },
    });

    const totalConnections =
      updated._count.sentConnections + updated._count.receivedConnections;

    return this.formatUser(
      updated,
      { status: 'SELF' },
      { connectionsCount: totalConnections, postsCount: updated._count.posts }
    );
  }
}

export const usersService = new UsersService();
