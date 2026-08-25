import { useState, useCallback } from 'react';
import type { AIResult, Tab, Lang } from '../types';
import { callGroq } from '../services/groq';
import { buildPrompt } from '../services/prompt';
import { callGemini } from '../services/gemini';

const initialResult: AIResult = { text: '', status: 'idle', duration: null };

export function useAI() {
    const [geminiResult, setGeminiResult] = useState<AIResult>(initialResult);

    const reset = useCallback(() => {
        setGeminiResult(initialResult);
    }, []);

    const run = useCallback(async (input: string, tab: Tab, lang: Lang, apiKey: string) => {
        const prompt = buildPrompt(input, tab, lang);
        const t0 = Date.now();
        const elapsed = () => parseFloat(((Date.now() - t0) / 1000).toFixed(1));

        setGeminiResult({ text: '', status: 'loading', duration: null });

        // await callGroq(prompt, apiKey)
        await callGemini(prompt, apiKey)
            .then((text) => setGeminiResult({ text, status: 'done', duration: elapsed() }))
            .catch((e: Error) => setGeminiResult({ text: e.message, status: 'error', duration: elapsed() }));

        
    }, []);

    return { geminiResult, run, reset };
}