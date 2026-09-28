import { api } from './api';
import type {
  PostResponse,
  CommentResponse,
  CreatePostRequest,
  CreateCommentRequest,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@techies-social/shared';

export interface GetPostsParams {
  page?: number;
  limit?: number;
  authorId?: string;
  feedType?: 'all' | 'connections';
}

export const postsApi = {
  async getPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<PostResponse>> {
    const res = await api.get<ApiSuccessResponse<PaginatedResponse<PostResponse>>>('/posts', {
      params,
    });
    return res.data.data;
  },

  async getPostById(id: string): Promise<PostResponse> {
    const res = await api.get<ApiSuccessResponse<PostResponse>>(`/posts/${id}`);
    return res.data.data;
  },

  async createPost(data: CreatePostRequest): Promise<PostResponse> {
    const res = await api.post<ApiSuccessResponse<PostResponse>>('/posts', data);
    return res.data.data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async toggleLike(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await api.post<ApiSuccessResponse<{ isLiked: boolean; likesCount: number }>>(
      `/posts/${id}/like`
    );
    return res.data.data;
  },

  async addComment(postId: string, data: CreateCommentRequest): Promise<CommentResponse> {
    const res = await api.post<ApiSuccessResponse<CommentResponse>>(
      `/posts/${postId}/comments`,
      data
    );
    return res.data.data;
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  },
};
