import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import { protect } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';

const app = express();

// Middleware - permissive CORS for production and preview deployments
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, postman, localhost, or any vercel.app domain
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
  })
);

app.options('*', cors());
app.use(express.json());

// Request logger for API calls
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root welcome & status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ledgerly MERN API',
    message: '🚀 Ledgerly backend is running successfully.',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        demo: 'POST /api/auth/demo',
        profile: 'GET /api/auth/me',
      },
      transactions: {
        list: 'GET /api/transactions',
        create: 'POST /api/transactions',
        analytics: 'GET /api/transactions/analytics/summary',
        exportCsv: 'GET /api/transactions/actions/export',
      },
    },
  });
});

app.get('/api', (req, res) => {
  res.redirect('/');
});

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  if (mongoose.connection.readyState === 1) {
    dbStatus = 'connected';
  } else {
    try {
      await connectDB();
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }
  }

  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    service: 'Ledgerly MERN API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Database connection middleware for all API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error on route:', req.originalUrl, err.message);
    res.status(503).json({
      message: 'Database connection failed. Please ensure MONGO_URI is set in environment variables.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', protect, transactionRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  // Cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server locally (not in serverless/Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await connectDB();
      const server = app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`🚀 Ledgerly API running on http://localhost:${PORT}`);
        console.log(`⚡ Health check: http://localhost:${PORT}/api/health`);
        console.log(`=========================================`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Server] Port ${PORT} is already in use by an existing process.`);
        } else {
          console.error('[Server] Server error:', err);
        }
      });

      const shutdown = async () => {
        console.log('Shutting down server gracefully...');
        server.close(async () => {
          await disconnectDB();
          console.log('Server and database closed.');
          process.exit(0);
        });
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    } catch (error) {
      console.error('Failed to initialize server:', error.message);
    }
  };

  startServer();
}

export default app;
