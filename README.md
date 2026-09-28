# TechiesSocial

A lightweight professional social networking platform for developers, engineers, designers, and technology professionals. Built as a full-stack TypeScript application demonstrating clean architecture, JWT authentication, relational data modeling with Prisma, unit testing, and a modern mobile experience with Expo.

## Features

- ✅ **Authentication**: Email/password registration & login with JWT — stateless, secure, no server-side sessions.
- ✅ **Session Persistence**: Secure token storage with Expo SecureStore on mobile and JWT verification.
- ✅ **Professional Profiles**: Headlines, bio, location, avatar, and skill badges.
- ✅ **User Discovery**: Directory search with real-time text query and skill filters.
- ✅ **Connection Lifecycle**: Send, accept, decline, and remove professional connections with relational state.
- ✅ **Posts & Rich Feed**: Publish posts, browse "All Techies" vs "My Network" feeds, like/unlike toggle, and comment threads.
- ✅ **Full Type Safety**: Monorepo shared DTOs and Prisma client across API and mobile client.
- ✅ **Automated Testing**: Vitest test suites covering business rules and edge cases.

## Tech Stack & Architecture

```
📱 Mobile (Expo SDK / React Native)
         ↓
🌐 Express.js REST API (TypeScript)
         ↓
🗄️ Prisma ORM (v6.x)
         ↓
🐘 PostgreSQL Database
```

## Repository Structure

```
techies-social/
├── apps/
│   ├── api/                   # Express.js REST API
│   │   ├── src/
│   │   │   ├── config/        # Environment validation with Zod
│   │   │   ├── lib/           # Prisma client singleton
│   │   │   ├── middleware/    # Auth (JWT), validation (Zod), error handlers
│   │   │   ├── modules/       # Auth, Users, Connections, Posts (Controller, Service, Schema)
│   │   │   ├── utils/         # Password hashing, JWT signing
│   │   │   └── server.ts      # Express application setup & routing
│   │   └── vitest.config.ts   # Vitest unit test configuration
│   │
│   └── mobile/                # Expo React Native App
│       ├── app/               # Expo Router file-based screens
│       │   ├── (auth)/        # Login & Register screens
│       │   ├── (tabs)/        # Feed, Discover, Network, Profile tabs
│       │   ├── users/[id].tsx # User Profile detail screen
│       │   └── posts/[id].tsx # Post discussion & comments screen
│       └── src/
│           ├── components/    # Avatar, Badge, Button, Input, Card, PostCard, UserCard, etc.
│           ├── constants/     # Design system & theme tokens
│           ├── services/      # Axios API client & endpoints
│           └── store/         # AuthContext & persistent session state
│
├── packages/
│   └── shared/                # Shared TypeScript types, DTOs, and Enums
│
├── prisma/
│   ├── schema.prisma          # Database schema (User, Connection, Post, Like, Comment)
│   └── seed.ts                # Database seed script with sample techie profiles & posts
│
├── package.json               # Root monorepo configuration with npm workspaces
└── README.md
```

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14 (or accessible database instance)

## Environment Setup

1. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment parameters:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/techies_social
   JWT_SECRET=your-secure-jwt-secret-key
   PORT=5001
   NODE_ENV=development
   ```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npm run db:generate

# 3. Apply migrations & seed data
npm run db:migrate
npm run db:seed

# 4. Start the API server (http://localhost:5001)
npm run api:dev

# 5. Start the mobile app
npm run mobile:start
```

## Running Tests & Quality Checks

```bash
# Run all unit and service tests
npm run test

# Run TypeScript typechecks across all packages
npm run typecheck
```

## API Specification

### Health Check
- `GET /api/health` — API health status and uptime

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `headline`, `skills`)
- `POST /api/auth/login` — Sign in with email & password
- `GET /api/auth/me` — Retrieve current authenticated profile

### Users & Directory
- `GET /api/users` — Discover and search directory (filters: `search`, `skill`, pagination)
- `GET /api/users/:id` — View specific user profile and mutual connection status
- `PATCH /api/users/profile` — Update current user's profile details & skills

### Connections & Network
- `GET /api/connections` — List accepted network connections
- `GET /api/connections/requests/pending` — List incoming invitations
- `GET /api/connections/requests/sent` — List sent invitations
- `POST /api/connections` — Send a connection request (`receiverId`)
- `PATCH /api/connections/:id` — Accept or reject a connection request (`status: ACCEPTED | REJECTED`)
- `DELETE /api/connections/:id` — Remove or cancel a connection

### Posts & Discussions
- `GET /api/posts` — Get feed posts (`feedType: all | connections`, pagination)
- `GET /api/posts/:id` — Get full post with comment thread
- `POST /api/posts` — Create a new post (`content`)
- `DELETE /api/posts/:id` — Delete authored post
- `POST /api/posts/:id/like` — Toggle like / unlike on post
- `POST /api/posts/:id/comments` — Add comment to post (`content`)
- `DELETE /api/posts/:id/comments/:commentId` — Delete comment
