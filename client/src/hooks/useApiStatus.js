import { useState, useEffect, useCallback } from 'react';
import { checkApiHealth, getAppConfig } from '../services/api';

export function useApiStatus(autoCheck = true, intervalMs = 30000) {
  const [status, setStatus] = useState({
    isConnected: true, // optimistic initial assumption
    isChecking: false,
    latencyMs: null,
    database: 'connected',
    lastChecked: null,
    error: null,
    config: getAppConfig(),
  });

  const check = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isChecking: true }));
    try {
      const result = await checkApiHealth();
      setStatus({
        isConnected: result.ok,
        isChecking: false,
        latencyMs: result.latencyMs,
        database: result.database,
        lastChecked: new Date(),
        error: result.error,
        config: getAppConfig(),
      });
      return result;
    } catch (err) {
      setStatus({
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        database: 'error',
        lastChecked: new Date(),
        error: err.message,
        config: getAppConfig(),
      });
      return { ok: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (!autoCheck) return;
    check();

    const timer = setInterval(() => {
      check();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoCheck, intervalMs, check]);

  return {
    ...status,
    checkNow: check,
  };
}

export default useApiStatus;
