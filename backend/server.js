require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const connectDB  = require('./config/db');
const apiRoutes  = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  'https://codejudge-ai.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server / curl (no origin header)
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.netlify.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    console.warn(`🚫 CORS blocked: ${origin}`);
    return callback(null, false); // return false, not an Error — avoids 500, returns 204/no header
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// ─── Middleware (order matters) ───────────────────────────────
app.use(cors(corsOptions));               // CORS first — before helmet
app.options('*', cors(corsOptions));      // Explicit preflight for all routes
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.set('trust proxy', 1);

// ─── Request logger ───────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path} | origin: ${req.headers.origin || 'none'} | ip: ${req.ip}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.json({
    name: 'AI Code Assistant API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      debug:  'POST /api/debug',
      history:'GET /api/history',
      run:    'POST /api/run',
    },
  });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found.` });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('❌ Unhandled error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err.message || 'Internal server error.'),
  });
});

// ─── Start ────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  });
};

start();
