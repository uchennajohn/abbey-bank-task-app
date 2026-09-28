import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostsService } from './posts.service.js';
import { prisma } from '../../lib/prisma.js';

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    post: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    comment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('PostsService', () => {
  let postsService: PostsService;

  beforeEach(() => {
    vi.clearAllMocks();
    postsService = new PostsService();
  });

  it('should create a new post', async () => {
    const mockUser = {
      id: 'author-1',
      name: 'Alan Turing',
      email: 'alan@test.com',
      headline: 'Computer Scientist',
      bio: null,
      location: null,
      avatarUrl: null,
      skills: ['Cryptography'],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.mocked(prisma.post.create).mockResolvedValue({
      id: 'post-1',
      content: 'Hello World! Just built a Turing machine simulation.',
      authorId: 'author-1',
      author: mockUser,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      _count: { likes: 0, comments: 0 },
    } as any);

    const result = await postsService.createPost('author-1', {
      content: 'Hello World! Just built a Turing machine simulation.',
    });

    expect(result.id).toBe('post-1');
    expect(result.content).toContain('Turing machine');
    expect(result.author.name).toBe('Alan Turing');
    expect(result.likesCount).toBe(0);
  });

  it('should toggle like on a post', async () => {
    vi.mocked(prisma.post.findUnique).mockResolvedValue({ id: 'post-1' } as any);
    vi.mocked(prisma.like.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.like.create).mockResolvedValue({ id: 'like-1' } as any);
    vi.mocked(prisma.like.count).mockResolvedValue(1);

    const liked = await postsService.toggleLike('post-1', 'user-1');
    expect(liked.isLiked).toBe(true);
    expect(liked.likesCount).toBe(1);

    // Toggle again to unlike
    vi.mocked(prisma.like.findUnique).mockResolvedValue({ id: 'like-1' } as any);
    vi.mocked(prisma.like.delete).mockResolvedValue({ id: 'like-1' } as any);
    vi.mocked(prisma.like.count).mockResolvedValue(0);

    const unliked = await postsService.toggleLike('post-1', 'user-1');
    expect(unliked.isLiked).toBe(false);
    expect(unliked.likesCount).toBe(0);
  });
});
