import { useState, useEffect, useCallback } from 'react';
import { fetchHistory } from '../utils/api';

export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchHistory();
      setHistory(res.data || []);
    } catch {
      // silently fail — history is a nice-to-have
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { history, loading, refresh: load };
};
