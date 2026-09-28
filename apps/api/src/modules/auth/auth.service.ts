import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signJwt } from '../../utils/jwt.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import { env } from '../../config/env.js';
import type { AuthResponse, UserResponse } from '@techies-social/shared';

export class AuthService {
  private formatUser(user: {
    id: string;
    name: string;
    email: string;
    headline: string | null;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
    skills: string[];
    createdAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
      skills: user.skills,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        headline: input.headline || null,
        skills: input.skills || [],
        authProvider: 'EMAIL',
      },
    });

    const token = signJwt({ userId: user.id, email: user.email });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = signJwt({ userId: user.id, email: user.email });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    const connectionsCount =
      user._count.sentConnections + user._count.receivedConnections;

    return {
      ...this.formatUser(user),
      connectionsCount,
      postsCount: user._count.posts,
    };
  }
}

export const authService = new AuthService();
