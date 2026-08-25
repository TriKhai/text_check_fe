import { useCallback, useState } from 'react';
import type { StatsResponse } from '../types';

export function useStats() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error(`Lỗi server (${res.status}).`);
      const json: StatsResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thống kê.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchStats };
}