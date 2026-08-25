
export type Tab = 'spell' | 'translate';
export type Lang = 'vi-en' | 'en-vi';
export type AIStatus = 'idle' | 'loading' | 'done' | 'error';

export interface AIResult {
  text: string;
  status: AIStatus;
  duration: number | null; // giây
}

export interface ApiKeys {
  gemini: string;
  groq: string;
}
