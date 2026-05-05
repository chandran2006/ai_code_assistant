import axios from 'axios';

// Normalize: strip trailing slash, ensure /api suffix
const rawBase = import.meta.env.VITE_API_URL || 'https://ai-code-assistant-zee5.onrender.com/api';
const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

if (import.meta.env.DEV) {
  console.log('[api] base URL:', API_BASE);
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: log in dev ──────────────────────────
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[api] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ── Response interceptor: retry + error normalisation ────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    const status = err.response?.status;

    // Retry once on network error or 502/503/504 (Render cold start)
    if (!config._retry && (!err.response || [502, 503, 504].includes(status))) {
      config._retry = true;
      console.warn('[api] Render cold start detected — retrying in 3s…');
      await new Promise((r) => setTimeout(r, 3000));
      return api(config);
    }

    // Normalise error message
    let message;
    if (status === 404) {
      message = `API route not found: ${config.url}. Check VITE_API_URL in Netlify env vars.`;
    } else if (status === 429) {
      message = 'Rate limit reached. Please wait a moment and try again.';
    } else if (!err.response) {
      message = err.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : 'Server unavailable. Check your connection.';
    } else {
      message = err.response?.data?.error || err.response?.data?.message || 'Something went wrong.';
    }

    console.error(`[api] ✗ ${status || 'network'} — ${message}`);
    return Promise.reject(new Error(message));
  }
);

export const analyzeCode = ({ code, language, explainLike5, roastMode, interviewMode }) =>
  api.post('/debug', { code, language, explainLike5, roastMode, interviewMode }).then((r) => r.data);

export const runCode = ({ code, language, stdin }) =>
  api.post('/run', { code, language, stdin }).then((r) => r.data);

export const fetchHistory = () =>
  api.get('/history').then((r) => r.data);

export const fetchHistoryById = (id) =>
  api.get(`/history/${id}`).then((r) => r.data);

export default api;
