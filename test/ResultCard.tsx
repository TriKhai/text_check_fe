import type { AIResult } from '../types';

interface Props {
  result: AIResult;
}

export function ResultCard({ result }: Props) {

  
  

  const handleCopy = () => {
    if (result.text) navigator.clipboard.writeText(result.text).catch(() => {});
  };

  const renderBody = () => {
    if (result.status === 'idle') return <span className="text-gray-400 italic">Kết quả sẽ hiển thị ở đây...</span>;
    if (result.status === 'loading') return <span className="text-gray-400 italic">Đang xử lý...</span>;
    if (result.status === 'error') return <span className="text-red-500">{result.text}</span>;
    return <span className="whitespace-pre-wrap">{result.text}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-1">Kết quả</p>
        <div className={`w-2 h-2 rounded-full ${
          result.status === 'idle' ? 'bg-gray-300' :
          result.status === 'loading' ? 'bg-yellow-400 animate-pulse' :
          result.status === 'done' ? 'bg-green-400' : 'bg-red-400'
        }`} />
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">AI</span>
      </div>

      {/* Body */}
      <div className="px-4 py-4 min-h-32 flex-1 text-sm leading-relaxed text-gray-700">
        {renderBody()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-400">
          {result.duration !== null ? `${result.duration}s` : ''}
        </span>
        <button
          onClick={handleCopy}
          disabled={result.status !== 'done'}
          className="text-xs text-blue-500 hover:bg-blue-50 px-2 py-1 rounded disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          Sao chép
        </button>
      </div>
    </div>
  );
}