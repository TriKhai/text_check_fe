import { useEffect } from 'react';
import { useStats } from '../hooks/useStats';

export function StatsPanel() {
  const { data, loading, error, fetchStats } = useStats();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <p className="text-sm text-slate-400">Đang tải...</p>;
  if (error) return <p className="text-sm text-rose-500">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng số request</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.totalRequests.toLocaleString('vi-VN')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian xử lý trung bình</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {data.avgDurationSeconds != null ? `${data.avgDurationSeconds}s` : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.byProvider.map((p) => (
          <div key={p.provider} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">{p.provider}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${p.errorRate > 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {p.errorRate}% lỗi
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold text-slate-900">{p.total}</p>
                <p className="text-slate-400">Tổng</p>
              </div>
              <div>
                <p className="font-bold text-emerald-600">{p.done}</p>
                <p className="text-slate-400">Thành công</p>
              </div>
              <div>
                <p className="font-bold text-rose-500">{p.errors}</p>
                <p className="text-slate-400">Lỗi</p>
              </div>
            </div>
            {p.topKey && (
              <p className="mt-3 text-xs text-slate-500">
                Key dùng nhiều nhất: <span className="font-semibold text-slate-700">#{p.topKey.key_used}</span> ({p.topKey.uses} lần)
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}