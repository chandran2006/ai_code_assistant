import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
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
