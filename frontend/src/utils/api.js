import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ai-code-assistant-zee5.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    // Retry once on network error or 502/503 (Render cold start)
    if (!config._retry && (!err.response || [502, 503].includes(err.response?.status))) {
      config._retry = true;
      await new Promise((r) => setTimeout(r, 3000));
      return api(config);
    }
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : 'Network error. Check your connection.');
    return Promise.reject(new Error(message));
  }
);

export const analyzeCode = async ({ code, language, explainLike5, roastMode, interviewMode }) => {
  const { data } = await api.post('/debug', { code, language, explainLike5, roastMode, interviewMode });
  return data;
};

export const runCode = async ({ code, language, stdin }) => {
  const { data } = await api.post('/run', { code, language, stdin });
  return data;
};

export const fetchHistory = async () => {
  const { data } = await api.get('/history');
  return data;
};

export const fetchHistoryById = async (id) => {
  const { data } = await api.get(`/history/${id}`);
  return data;
};

export default api;
