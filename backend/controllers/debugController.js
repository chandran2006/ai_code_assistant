const mongoose = require('mongoose');
const { analyzeCode } = require('../services/aiService');
const Query = require('../models/Query');

const debugCode = async (req, res) => {
  const { code, language, explainLike5, roastMode, interviewMode } = req.body;
  const startTime = Date.now();

  try {
    const result = await analyzeCode(code, language, explainLike5, roastMode, interviewMode);
    const processingTime = Date.now() - startTime;

    // Skip DB write for cache hits or when DB is disconnected
    const dbReady = mongoose.connection.readyState === 1;
    if (result.aiProvider !== 'cache' && dbReady) {
      try {
        await Query.create({ language, code, result, explainLike5, roastMode, interviewMode, processingTime, ipAddress: req.ip, cacheKey: result.cacheKey });
      } catch (dbErr) {
        console.warn('⚠️  Failed to save query to DB:', dbErr.message);
      }
    }

    return res.status(200).json({ success: true, data: result, processingTime });
  } catch (err) {
    console.error('❌ AI Service Error:', err.message);
    if (err?.status === 429) return res.status(429).json({ success: false, error: 'Rate limit reached. Please wait a moment.' });
    if (err?.status === 401) return res.status(500).json({ success: false, error: 'AI service authentication failed.' });
    return res.status(500).json({ success: false, error: err.message || 'Failed to analyze code. Please try again.' });
  }
};

const getHistory = async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ success: false, error: 'Database unavailable.' });
  try {
    const history = await Query.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('language code result.score createdAt processingTime explainLike5 roastMode interviewMode')
      .lean();
    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch history.' });
  }
};

const getHistoryById = async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.status(503).json({ success: false, error: 'Database unavailable.' });
  try {
    const query = await Query.findById(req.params.id).lean();
    if (!query) return res.status(404).json({ success: false, error: 'Query not found.' });
    return res.status(200).json({ success: true, data: query });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch query.' });
  }
};

module.exports = { debugCode, getHistory, getHistoryById };
