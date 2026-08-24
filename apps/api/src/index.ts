import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/env';
import { errorHandler } from '@/middleware/errorHandler';
import { healthRouter } from '@/routes/health.route';

const app = express();

// ─── Security Middleware ─────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

// ─── Body Parsing ────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ──────────────────────────────────────
app.use('/api/v1', healthRouter);

// ─── Error Handling ──────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(`[api] Server running on http://localhost:${config.PORT}`);
  console.log(`[api] Environment: ${config.NODE_ENV}`);
});

export { app };
