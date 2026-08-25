import { useEffect, useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { PROVIDERS } from '../types';
import type { Provider } from '../types';

export function HistoryTable() {
  const { data, loading, error, fetchHistory } = useHistory();
  const [page, setPage] = useState(1);
  const [providerFilter, setProviderFilter] = useState<Provider | ''>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'done' | 'error'>('');

  useEffect(() => {
    fetchHistory(page, 20, {
      provider: providerFilter || undefined,
      status: statusFilter || undefined,
    });
  }, [page, providerFilter, statusFilter, fetchHistory]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={providerFilter}
          onChange={(e) => { setProviderFilter(e.target.value as Provider | ''); setPage(1); }}
          className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="">Tất cả provider</option>
          {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as '' | 'done' | 'error'); setPage(1); }}
          className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="done">Thành công</option>
          <option value="error">Lỗi</option>
        </select>
        {data && <span className="ml-auto text-xs text-slate-400">{data.total} bản ghi</span>}
      </div>

      {loading && <p className="text-sm text-slate-400">Đang tải...</p>}
      {error && <p className="text-sm text-rose-500">{error}</p>}

      {!loading && !error && data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Thời gian</th>
                  <th className="px-3 py-2 font-semibold">Provider</th>
                  <th className="px-3 py-2 font-semibold">Tab</th>
                  <th className="px-3 py-2 font-semibold">Ngôn ngữ</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Key</th>
                  <th className="px-3 py-2 font-semibold">Lần thử</th>
                  <th className="px-3 py-2 font-semibold">Thời gian xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id} className="text-slate-600">
                    <td className="px-3 py-2 whitespace-nowrap">{item.created_at}</td>
                    <td className="px-3 py-2">{item.provider}</td>
                    <td className="px-3 py-2">{item.tab}</td>
                    <td className="px-3 py-2">{item.lang}</td>
                    <td className="px-3 py-2">
                      <span className={item.status === 'done' ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>
                        {item.status === 'done' ? 'Thành công' : 'Lỗi'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{item.key_used ?? '—'}</td>
                    <td className="px-3 py-2">{item.attempts}</td>
                    <td className="px-3 py-2">{item.duration != null ? `${item.duration}s` : '—'}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">Chưa có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Trang {data.page} / {data.totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="rounded border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                className="rounded border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}