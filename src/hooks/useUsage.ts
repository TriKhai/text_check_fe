import { useCallback, useState } from 'react';
import type { UsageResponse } from '../types';

export function useUsage() {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/usage');
      if (!res.ok) throw new Error(`Lỗi server (${res.status}).`);
      const json: UsageResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải usage.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchUsage };
}