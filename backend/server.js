import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import ownerRoutes from './routes/owner.js';
import tenantRoutes from './routes/tenant.js';
import paytmRoutes from './routes/paytm.js';
import subscriptionRoutes from './routes/subscription.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Extremely flexible mode for deployments
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Needed for Paytm callback (form POST)
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ✅ Test route (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/paytm', paytmRoutes);
app.use('/api/subscription', subscriptionRoutes);

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});