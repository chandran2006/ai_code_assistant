require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        process.env.FRONTEND_URL || 'https://codejudge-ai.netlify.app',
        'https://codejudge-ai.netlify.app',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (allowed.includes(origin) || origin.endsWith('.netlify.app')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// ─── Trust proxy (for Render/Vercel) ────────────────────────
app.set('trust proxy', 1);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Code Assistant API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      debug: 'POST /api/debug',
      history: 'GET /api/history',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
