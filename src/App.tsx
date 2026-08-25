import { useRef, useState } from 'react';
import { usePersistedState } from './hooks/usePersistedState';
import { PROVIDERS } from './types';
import type { Provider, Lang, Tab } from './types';
import { useAI } from './hooks/useAI';
import { ResultCard } from './components/ResultCard';
import { DashboardPanel } from './components/DashboardPanel';
import { readTextFromFile } from './utils/fileIO';

const Icon = ({ name, className = 'size-5' }: { name: 'spark' | 'swap' | 'play' | 'upload'; className?: string }) => {
  const paths = {
    spark: <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Zm6 12 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />,
    swap: <path d="m7 7 3-3 1.4 1.4L10.8 6H17a3 3 0 0 1 3 3v1h-2V9a1 1 0 0 0-1-1h-6.2l.6.6L10 10 7 7Zm10 10-3 3-1.4-1.4.6-.6H7a3 3 0 0 1-3-3v-1h2v1a1 1 0 0 0 1 1h6.2l-.6-.6L14 14l3 3Z" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    upload: <path d="M12 3l4.5 4.5-1.4 1.4L13 6.8V15h-2V6.8L8.9 8.9 7.5 7.5 12 3Zm-7 14h14v2H5v-2Z" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">{paths[name]}</svg>;
};

export default function App() {
  const [tab, setTab] = usePersistedState<Tab>('transfixer_tab', 'spell');
  const [lang, setLang] = usePersistedState<Lang>('transfixer_lang', 'vi-en');
  const [input, setInput] = useState('');
  const [provider, setProvider] = usePersistedState<Provider>('transfixer_provider', 'Gemini');
  const { result, run, reset } = useAI(provider);

  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const changeTab = (nextTab: Tab) => { setTab(nextTab); reset(); };
  const changeLanguage = () => { setLang(lang === 'vi-en' ? 'en-vi' : 'vi-en'); reset(); };
  const isLoading = result.status === 'loading';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // cho phép chọn lại cùng 1 file lần sau
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const text = await readTextFromFile(file);
      setInput(text);
      reset();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Không thể đọc file.');
    } finally {
      setUploading(false);
    }
  };

  const placeholder = tab === 'spell'
    ? 'Nhập hoặc dán văn bản tiếng Việt cần kiểm tra...'
    : lang === 'vi-en'
      ? 'Nhập văn bản tiếng Việt cần dịch sang tiếng Anh...'
      : 'Enter English text to translate into Vietnamese...';

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 lg:px-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Icon name="spark" /></div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">TransFixer</h1>
            <p className="text-xs text-slate-500">Trợ lý văn bản thông minh</p>
          </div>
          {/* Chọn provider — key được server quản lý qua .env, FE không cần nhập key */}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="provider" className="text-xs font-semibold text-slate-500">Model</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setDashboardOpen(true)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            Bảng điều khiển
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-10">
        {/* <section className="mb-7">
          <p className="mb-2 text-sm font-semibold text-indigo-600">Không bỏ sót ý, không mất thời gian</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Hoàn thiện văn bản trong vài giây.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Kiểm tra chính tả hoặc dịch thuật</p>
        </section> */}

        <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button onClick={() => changeTab('spell')} className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${tab === 'spell' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Kiểm tra chính tả</button>
          <button onClick={() => changeTab('translate')} className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${tab === 'translate' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Dịch thuật</button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Văn bản đầu vào</p>
                <p className="mt-1 text-xs text-slate-400">{tab === 'spell' ? 'Tiếng Việt' : 'Chọn chiều dịch phù hợp'}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="spinner size-3.5 rounded-full border-2 border-slate-300 border-t-slate-600" />
                  ) : (
                    <Icon name="upload" className="size-4 text-slate-400" />
                  )}
                  Tải file lên
                </button>
                {tab === 'translate' && (
                  <button onClick={changeLanguage} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50">
                    <span className={lang === 'vi-en' ? 'text-indigo-600' : ''}>VI</span><Icon name="swap" className="size-4 text-slate-400" /><span className={lang === 'en-vi' ? 'text-indigo-600' : ''}>EN</span>
                  </button>
                )}
              </div>
            </div>
            {uploadError && (
              <div className="mx-5 mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {uploadError}
              </div>
            )}
            <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} className="min-h-[360px] flex-1 resize-none px-5 py-5 text-[15px] leading-7 text-slate-700 outline-none placeholder:text-slate-300" />
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">{input.length.toLocaleString('vi-VN')} ký tự</span>
                <button
                  onClick={() => run(input, tab, lang)}
                  disabled={isLoading || !input.trim()}
                  className="ml-auto flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isLoading ? <> <span className="spinner size-4 rounded-full border-2 border-white/40 border-t-white" />Đang xử lý</> : <> <Icon name="play" className="size-4" />Bắt đầu</>}
                </button>
              </div>
            </div>
          </section>
          <ResultCard result={result} />
        </div>
      </main>

      {dashboardOpen && <DashboardPanel onClose={() => setDashboardOpen(false)} />}
    </div>
  );
}