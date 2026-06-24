import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import ownerRoutes from './routes/owner.js';
import tenantRoutes from './routes/tenant.js';
import paytmRoutes from './routes/paytm.js';
import subscriptionRoutes from './routes/subscription.js';
import cashfreeRoutes from './routes/cashfree.js';
import notificationRoutes from './routes/notifications.js';
import { startCronJobs } from './cronJobs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Gzip all responses (cuts payload size ~70%) ─────────────────────────────
app.use(compression());

// ─── Rate limiting — 200 requests per 15 minutes per IP ──────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/', // skip health-check pings
});
app.use(limiter);

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/paytm', paytmRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/cashfree', cashfreeRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Cron Jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});