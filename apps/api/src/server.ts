import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { connectionsRouter } from './modules/connections/connections.routes.js';
import { postsRouter } from './modules/posts/posts.routes.js';
import type { ApiSuccessResponse } from '@techies-social/shared';

const app = express();

// ─── Global Middleware ───────────────────────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Health Check ────────────────────────────────────────────────────────────

interface HealthData {
  status: string;
  timestamp: string;
  environment: string;
}

app.get('/api/health', (_req, res: express.Response<ApiSuccessResponse<HealthData>>) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/posts', postsRouter);

// ─── 404 & Error Handling ────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`🚀 TechiesSocial API running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
  });
}

export default app;
