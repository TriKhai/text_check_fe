import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIResult } from '../types';
import { downloadAsTxt, downloadAsDocx } from '../utils/fileIO';

export function ResultCard({ result }: { result: AIResult }) {
  const [copied, setCopied] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const copyResult = async () => {
    if (!result.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const exportTxt = () => {
    if (!result.text) return;
    downloadAsTxt(result.text, 'ket-qua.txt');
  };

  const exportDocx = async () => {
    if (!result.text) return;
    setExportingDocx(true);
    try {
      await downloadAsDocx(result.text, 'ket-qua.docx');
    } finally {
      setExportingDocx(false);
    }
  };

  const status = {
    idle: { label: 'Sẵn sàng', dot: 'bg-slate-300', text: 'text-slate-500', bg: 'bg-slate-100' },
    loading: { label: 'Đang xử lý', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-700', bg: 'bg-amber-50' },
    done: { label: 'Hoàn tất', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    error: { label: 'Cần kiểm tra', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
  }[result.status];

  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Kết quả</p>
          <p className="mt-1 text-xs text-slate-400">Nội dung do AI xử lý</p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.bg} ${status.text}`}>
          <span className={`size-1.5 rounded-full ${status.dot}`} />{status.label}
        </div>
      </div>

      <div className="flex-1 px-5 py-5 text-[15px] leading-7 text-slate-700">
        {result.status === 'idle' && (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl">✦</div>
            <p className="font-semibold text-slate-500">Kết quả sẽ xuất hiện tại đây</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Nhập văn bản rồi nhấn "Bắt đầu".</p>
          </div>
        )}
        {result.status === 'loading' && (
          <div className="space-y-3 pt-2"><div className="skeleton h-4 w-11/12 rounded" /><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-4 w-8/12 rounded" /></div>
        )}
        {result.status === 'error' && <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{result.text}</div>}
        {result.status === 'done' && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ ...props }) => <h1 className="mb-2 mt-4 text-lg font-bold text-slate-900 first:mt-0" {...props} />,
              h2: ({ ...props }) => <h2 className="mb-2 mt-4 text-base font-bold text-slate-900 first:mt-0" {...props} />,
              h3: ({ ...props }) => <h3 className="mb-1.5 mt-3 text-xs font-bold uppercase tracking-wider text-indigo-600 first:mt-0" {...props} />,
              p: ({ ...props }) => <p className="mb-3 leading-7 last:mb-0" {...props} />,
              strong: ({ ...props }) => <strong className="font-bold text-slate-900" {...props} />,
              em: ({ ...props }) => <em className="italic" {...props} />,
              ul: ({ ...props }) => <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0" {...props} />,
              ol: ({ ...props }) => <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0" {...props} />,
              li: ({ ...props }) => <li className="leading-6" {...props} />,
              hr: () => <hr className="my-4 border-slate-200" />,
              code: ({ ...props }) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-slate-700" {...props} />,
            }}
          >
            {result.text}
          </ReactMarkdown>
        )}
      </div>

      <div className="flex min-h-16 flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        {result.duration !== null && <span className="text-xs text-slate-400">{result.duration}s</span>}
        {result.status === 'done' && result.keyUsed !== null && (
          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">Key #{result.keyUsed}{result.attempts > 1 ? ` · ${result.attempts} lần thử` : ''}</span>
        )}
        {result.status === 'done' && result.tokensUsed != null && (
          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">{result.tokensUsed.toLocaleString('vi-VN')} tokens</span>
        )}
        {result.status === 'done' && result.rateLimit != null && (
          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            Còn lại: {result.rateLimit.remainingRequests ?? '—'} req / {result.rateLimit.remainingTokens ?? '—'} token
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportTxt} disabled={result.status !== 'done'} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">
            Xuất .txt
          </button>
          <button onClick={exportDocx} disabled={result.status !== 'done' || exportingDocx} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">
            {exportingDocx ? 'Đang tạo…' : 'Xuất .docx'}
          </button>
          <button onClick={copyResult} disabled={result.status !== 'done'} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
        </div>
      </div>
    </section>
  );
}