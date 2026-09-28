import { prisma } from '../../lib/prisma.js';
import type { CreatePostInput, CreateCommentInput, GetPostsQueryInput } from './posts.schema.js';
import type {
  PostResponse,
  CommentResponse,
  PaginatedResponse,
  UserResponse,
} from '@techies-social/shared';

export class PostsService {
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

  private formatComment(comment: any): CommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      authorId: comment.authorId,
      author: this.formatUser(comment.author),
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  private formatPost(post: any, currentUserId?: string): PostResponse {
    const isLikedByMe = currentUserId
      ? post.likes?.some((like: any) => like.userId === currentUserId)
      : false;

    return {
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      author: this.formatUser(post.author),
      likesCount: post._count?.likes ?? post.likes?.length ?? 0,
      commentsCount: post._count?.comments ?? post.comments?.length ?? 0,
      isLikedByMe,
      comments: post.comments?.map((c: any) => this.formatComment(c)),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async createPost(authorId: string, input: CreatePostInput): Promise<PostResponse> {
    const post = await prisma.post.create({
      data: {
        content: input.content,
        authorId,
      },
      include: {
        author: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return this.formatPost(post, authorId);
  }

  async getPosts(
    currentUserId: string | undefined,
    query: GetPostsQueryInput
  ): Promise<PaginatedResponse<PostResponse>> {
    const { page, limit, authorId, feedType } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (authorId) {
      where.authorId = authorId;
    } else if (feedType === 'connections' && currentUserId) {
      // Find all accepted connection user IDs
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { requesterId: currentUserId, status: 'ACCEPTED' },
            { receiverId: currentUserId, status: 'ACCEPTED' },
          ],
        },
      });

      const connectedUserIds = connections.map((c) =>
        c.requesterId === currentUserId ? c.receiverId : c.requesterId
      );
      // Include current user's posts and connected users' posts
      where.authorId = { in: [...connectedUserIds, currentUserId] };
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
              }
            : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    const items = posts.map((post) => this.formatPost(post, currentUserId));

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    };
  }

  async getPostById(postId: string, currentUserId?: string): Promise<PostResponse> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
            }
          : false,
        comments: {
          include: {
            author: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return this.formatPost(post, currentUserId);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized: You can only delete your own posts');
    }

    await prisma.post.delete({
      where: { id: postId },
    });
  }

  async toggleLike(
    postId: string,
    userId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      isLiked = true;
    }

    const likesCount = await prisma.like.count({
      where: { postId },
    });

    return { isLiked, likesCount };
  }

  async addComment(
    postId: string,
    authorId: string,
    input: CreateCommentInput
  ): Promise<CommentResponse> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        postId,
        authorId,
      },
      include: {
        author: true,
      },
    });

    return this.formatComment(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}

export const postsService = new PostsService();
