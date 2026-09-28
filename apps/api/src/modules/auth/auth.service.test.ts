import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { prisma } from '../../lib/prisma.js';
import * as passwordUtils from '../../utils/password.js';

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  it('should register a new user successfully and return JWT', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hashed-pwd',
      headline: 'First Programmer',
      bio: null,
      location: 'London',
      avatarUrl: null,
      skills: ['Math', 'Algorithms'],
      authProvider: 'EMAIL',
      googleId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    } as any);

    const result = await authService.register({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secretpassword',
      headline: 'First Programmer',
      skills: ['Math', 'Algorithms'],
    });

    expect(result.user.name).toBe('Ada Lovelace');
    expect(result.user.email).toBe('ada@example.com');
    expect(result.token).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalledOnce();
  });

  it('should throw error if email is already taken', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-id',
      email: 'ada@example.com',
    } as any);

    await expect(
      authService.register({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('An account with this email already exists');
  });

  it('should login an existing user with valid password', async () => {
    const hashed = await passwordUtils.hashPassword('validpassword');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: hashed,
      headline: null,
      bio: null,
      location: null,
      avatarUrl: null,
      skills: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as any);

    const result = await authService.login({
      email: 'ada@example.com',
      password: 'validpassword',
    });

    expect(result.user.email).toBe('ada@example.com');
    expect(result.token).toBeDefined();
  });

  it('should throw error for invalid password', async () => {
    const hashed = await passwordUtils.hashPassword('correctpassword');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u-1',
      email: 'ada@example.com',
      passwordHash: hashed,
    } as any);

    await expect(
      authService.login({
        email: 'ada@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Invalid email or password');
  });
});
