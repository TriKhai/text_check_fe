import { useState } from 'react';
import { HistoryTable } from './HistoryTable';
import { StatsPanel } from './StatsPanel';
import { UsagePanel } from './UsagePanel';

type DashTab = 'history' | 'stats' | 'usage';

export function DashboardPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<DashTab>('stats');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Bảng điều khiển</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="flex gap-1 border-b border-slate-100 px-6 pt-3">
          {([
            ['stats', 'Thống kê'],
            ['history', 'Lịch sử'],
            ['usage', 'Usage'],
          ] as [DashTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-t-lg px-4 py-2 text-sm font-bold transition ${
                tab === key ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {tab === 'stats' && <StatsPanel />}
          {tab === 'history' && <HistoryTable />}
          {tab === 'usage' && <UsagePanel />}
        </div>
      </div>
    </div>
  );
}