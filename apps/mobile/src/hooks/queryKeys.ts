// Query key factory for centralized, predictable cache keys
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    me: ['users', 'me'] as const,
  },
  connections: {
    all: ['connections'] as const,
    list: ['connections', 'list'] as const,
    requests: ['connections', 'requests'] as const,
    sent: ['connections', 'sent'] as const,
  },
  posts: {
    all: ['posts'] as const,
    feed: ['posts', 'feed'] as const,
    userPosts: (userId: string) => ['posts', 'user', userId] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
  },
} as const;
