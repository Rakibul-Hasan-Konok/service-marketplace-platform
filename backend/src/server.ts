import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { vendorRouter } from './routes/vendor.js';
import { userRouter } from './routes/user.js';
import { adminRouter } from './routes/admin.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    name: 'Service Marketplace API',
    health: '/api/health',
    services: '/api/services',
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api', publicRouter);
app.use('/api/vendor', vendorRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', issues: err.issues });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
