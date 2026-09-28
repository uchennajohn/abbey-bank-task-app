import { prisma } from '../../lib/prisma.js';
import { ConnectionStatus } from '@techies-social/shared';
import type { ConnectionResponse, UserResponse } from '@techies-social/shared';

export class ConnectionsService {
  private formatUser(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
      skills: user.skills || [],
      createdAt: user.createdAt.toISOString(),
    };
  }

  private formatConnection(c: any): ConnectionResponse {
    return {
      id: c.id,
      requesterId: c.requesterId,
      receiverId: c.receiverId,
      status: c.status as ConnectionStatus,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      requester: this.formatUser(c.requester),
      receiver: this.formatUser(c.receiver),
    };
  }

  async sendRequest(
    requesterId: string,
    receiverId: string
  ): Promise<ConnectionResponse> {
    if (requesterId === receiverId) {
      throw new Error('You cannot send a connection request to yourself');
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new Error('Target user does not exist');
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new Error('You are already connected with this user');
      }
      if (existing.status === ConnectionStatus.PENDING) {
        if (existing.requesterId === requesterId) {
          throw new Error('A connection request is already pending');
        } else {
          // If the other user already sent a request, auto-accept it!
          const accepted = await prisma.connection.update({
            where: { id: existing.id },
            data: { status: ConnectionStatus.ACCEPTED },
            include: { requester: true, receiver: true },
          });
          return this.formatConnection(accepted);
        }
      }
      // If rejected before, reset to pending with requester as current user
      const updated = await prisma.connection.update({
        where: { id: existing.id },
        data: {
          requesterId,
          receiverId,
          status: ConnectionStatus.PENDING,
        },
        include: { requester: true, receiver: true },
      });
      return this.formatConnection(updated);
    }

    const created = await prisma.connection.create({
      data: {
        requesterId,
        receiverId,
        status: ConnectionStatus.PENDING,
      },
      include: {
        requester: true,
        receiver: true,
      },
    });

    return this.formatConnection(created);
  }

  async updateStatus(
    connectionId: string,
    userId: string,
    status: ConnectionStatus.ACCEPTED | ConnectionStatus.REJECTED
  ): Promise<ConnectionResponse> {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection request not found');
    }

    if (connection.receiverId !== userId) {
      throw new Error('Only the recipient can respond to this connection request');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new Error(`This request has already been ${connection.status.toLowerCase()}`);
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
      include: {
        requester: true,
        receiver: true,
      },
    });

    return this.formatConnection(updated);
  }

  async removeConnection(connectionId: string, userId: string): Promise<void> {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.requesterId !== userId && connection.receiverId !== userId) {
      throw new Error('Not authorized to remove this connection');
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    });
  }

  async getMyConnections(userId: string): Promise<UserResponse[]> {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId, status: ConnectionStatus.ACCEPTED },
          { receiverId: userId, status: ConnectionStatus.ACCEPTED },
        ],
      },
      include: {
        requester: {
          include: {
            _count: {
              select: {
                sentConnections: { where: { status: 'ACCEPTED' } },
                receivedConnections: { where: { status: 'ACCEPTED' } },
                posts: true,
              },
            },
          },
        },
        receiver: {
          include: {
            _count: {
              select: {
                sentConnections: { where: { status: 'ACCEPTED' } },
                receivedConnections: { where: { status: 'ACCEPTED' } },
                posts: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return connections.map((c) => {
      const isRequesterMe = c.requesterId === userId;
      const targetUser = isRequesterMe ? c.receiver : c.requester;
      const totalConnections =
        targetUser._count.sentConnections + targetUser._count.receivedConnections;

      return {
        ...this.formatUser(targetUser),
        connectionStatus: ConnectionStatus.ACCEPTED,
        connectionId: c.id,
        isRequester: isRequesterMe,
        connectionsCount: totalConnections,
        postsCount: targetUser._count.posts,
      };
    });
  }

  async getPendingRequests(userId: string): Promise<ConnectionResponse[]> {
    const requests = await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: ConnectionStatus.PENDING,
      },
      include: {
        requester: true,
        receiver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((c) => this.formatConnection(c));
  }

  async getSentRequests(userId: string): Promise<ConnectionResponse[]> {
    const requests = await prisma.connection.findMany({
      where: {
        requesterId: userId,
        status: ConnectionStatus.PENDING,
      },
      include: {
        requester: true,
        receiver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((c) => this.formatConnection(c));
  }
}

export const connectionsService = new ConnectionsService();
