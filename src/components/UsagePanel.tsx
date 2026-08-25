import { useEffect } from 'react';
import { useUsage } from '../hooks/useUsage';

function ProgressBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function UsagePanel() {
  const { data, loading, error, fetchUsage } = useUsage();

  // Tự refresh mỗi 15s để phản ánh cửa sổ 60s gần nhất
  useEffect(() => {
    fetchUsage();
    const interval = window.setInterval(fetchUsage, 15000);
    return () => window.clearInterval(interval);
  }, [fetchUsage]);

  if (loading && !data) return <p className="text-sm text-slate-400">Đang tải...</p>;
  if (error) return <p className="text-sm text-rose-500">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <p className="mb-4 text-xs text-slate-400">
        RPM/TPM tính theo {data.windowSeconds}s gần nhất, RPD tính theo 24h gần nhất. Tự làm mới mỗi 15s. RPM (Requests per minute), TPM (Tokens per minute (input)), RPD (Requests per day).
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.byModel.map((m) => (
          <div key={m.model} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-slate-800">{m.model}</p>

            <div className="mb-3">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>RPM</span>
                <span className="font-semibold">{m.rpm.used} / {m.rpm.limit}</span>
              </div>
              <ProgressBar used={m.rpm.used} limit={m.rpm.limit} />
            </div>

            <div className="mb-3">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>TPM</span>
                <span className="font-semibold">
                  {m.tpm.used.toLocaleString('vi-VN')} / {m.tpm.limit.toLocaleString('vi-VN')}
                </span>
              </div>
              <ProgressBar used={m.tpm.used} limit={m.tpm.limit} />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>RPD</span>
                <span className="font-semibold">{m.rpd.used} / {m.rpd.limit}</span>
              </div>
              <ProgressBar used={m.rpd.used} limit={m.rpd.limit} />
            </div>
          </div>
        ))}
      </div>

      {data.rateLimit.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Rate limit gần nhất (Groq)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.rateLimit.map((r) => (
              <div key={r.provider} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold">{r.provider}:</span> còn {r.remainingRequests ?? '—'} req / {r.remainingTokens ?? '—'} token
                <span className="ml-1 text-slate-400">({r.reportedAt})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}