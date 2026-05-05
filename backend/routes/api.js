const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateDebugInput, validateRunInput } = require('../middleware/validate');
const { debugCode, getHistory, getHistoryById } = require('../controllers/debugController');
const { runCode } = require('../controllers/runController');

const router = express.Router();

// Rate limiter: relaxed in dev, strict in production
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait 15 minutes before trying again.',
  },
});

const historyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Slow down.' },
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Code Assistant API is running',
    timestamp: new Date().toISOString(),
  });
});

// Core debug endpoint
router.post('/debug', apiLimiter, validateDebugInput, debugCode);

// Code execution endpoint
router.post('/run', apiLimiter, validateRunInput, runCode);

// History endpoints
router.get('/history',     historyLimiter, getHistory);
router.get('/history/:id', historyLimiter, getHistoryById);

module.exports = router;
