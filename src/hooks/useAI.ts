import { useCallback, useState } from 'react';
import type { AIResult, Lang, Provider, Tab } from '../types';
import { INITIAL_RESULT } from '../types';

export function useAI(provider: Provider) {
  const [result, setResult] = useState<AIResult>(INITIAL_RESULT);

  const reset = useCallback(() => setResult(INITIAL_RESULT), []);

  const run = useCallback(
    async (text: string, tab: Tab, lang: Lang) => { // bỏ tham số apiKeys — server tự quản lý key
      if (!text.trim()) return;

      setResult({ ...INITIAL_RESULT, status: 'loading' });

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, tab, lang, provider }), // bỏ apiKeys khỏi body
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `Lỗi server (${res.status}).`);
        }

        const data: AIResult = await res.json();
        setResult(data);
      } catch (error) {
        setResult({
          ...INITIAL_RESULT,
          text: error instanceof Error ? error.message : 'Không thể kết nối tới server.',
          status: 'error',
        });
      }
    },
    [provider],
  );

  return { result, run, reset };
}