// ─── Enums ───────────────────────────────────────────────────────────────────

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

// ─── User DTOs ───────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  skills: string[];
  connectionStatus?: ConnectionStatus | 'NONE' | 'SELF';
  connectionId?: string | null;
  isRequester?: boolean;
  connectionsCount?: number;
  postsCount?: number;
  createdAt: string;
}

// ─── Connection DTOs ─────────────────────────────────────────────────────────

export interface ConnectionResponse {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  requester: UserResponse;
  receiver: UserResponse;
}

// ─── Comment DTOs ────────────────────────────────────────────────────────────

export interface CommentResponse {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: UserResponse;
  createdAt: string;
  updatedAt: string;
}

// ─── Post DTOs ───────────────────────────────────────────────────────────────

export interface PostResponse {
  id: string;
  content: string;
  authorId: string;
  author: UserResponse;
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  comments?: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  headline?: string;
  skills?: string[];
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface UpdateProfileRequest {
  name?: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  skills?: string[];
  avatarUrl?: string | null;
}

export interface CreatePostRequest {
  content: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface SendConnectionRequest {
  receiverId: string;
}

export interface UpdateConnectionStatusRequest {
  status: ConnectionStatus.ACCEPTED | ConnectionStatus.REJECTED;
}
