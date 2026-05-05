import { useState, useCallback, useRef } from 'react';
import { analyzeCode } from '../utils/api';

const COOLDOWN_SEC = 15;

export const useAnalyzer = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SEC);
    let remaining = COOLDOWN_SEC;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 1000);
  }, []);

  const analyze = useCallback(async ({ code, language, explainLike5, roastMode, interviewMode }) => {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setProcessingTime(null);
    try {
      const response = await analyzeCode({ code, language, explainLike5, roastMode, interviewMode });
      setResult(response.data || {});
      setProcessingTime(response.processingTime);
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred.';
      const isRateLimit = msg.toLowerCase().includes('rate limit') || msg.includes('429');
      setError(isRateLimit ? 'rate_limit' : msg);
      if (isRateLimit) startCooldown();
    } finally {
      setLoading(false);
    }
  }, [cooldown, startCooldown]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProcessingTime(null);
  }, []);

  return { result, loading, error, processingTime, cooldown, analyze, reset };
};
