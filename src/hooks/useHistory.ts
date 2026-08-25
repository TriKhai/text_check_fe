import { useCallback, useState } from 'react';
import type { HistoryResponse } from '../types';

export function useHistory() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (page = 1, pageSize = 20, filters: { provider?: string; status?: string } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (filters.provider) params.set('provider', filters.provider);
        if (filters.status) params.set('status', filters.status);

        const res = await fetch(`/api/history?${params.toString()}`);
        if (!res.ok) throw new Error(`Lỗi server (${res.status}).`);
        const json: HistoryResponse = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch sử.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, loading, error, fetchHistory };
}