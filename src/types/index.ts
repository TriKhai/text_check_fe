export type Provider = 'Gemini' | 'Groq';
export const PROVIDERS: Provider[] = ['Gemini', 'Groq'];

export type Tab = 'spell' | 'translate';
export type Lang = 'vi-en' | 'en-vi';
export type AIStatus = 'idle' | 'loading' | 'done' | 'error';

export interface ProviderRateLimit {
  remainingRequests: number | null;
  remainingTokens: number | null;
}

export interface AIResult {
  text: string;
  status: AIStatus;
  duration: number | null;
  keyUsed: number | null;
  attempts: number;
  tokensUsed: number | null;
  rateLimit: ProviderRateLimit | null;
}

export const INITIAL_RESULT: AIResult = {
  text: '',
  status: 'idle',
  duration: null,
  keyUsed: null,
  attempts: 0,
  tokensUsed: null,
  rateLimit: null,
};

// ===== History =====
export interface HistoryItem {
  id: number;
  created_at: string;
  provider: string;
  tab: string;
  lang: string;
  input_length: number;
  status: 'done' | 'error';
  key_used: number | null;
  attempts: number;
  duration: number | null;
  error_message: string | null;
}

export interface HistoryResponse {
  items: HistoryItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ===== Stats =====
export interface ProviderStat {
  provider: string;
  total: number;
  done: number;
  errors: number;
  errorRate: number;
  topKey: { provider: string; key_used: number; uses: number } | null;
}

export interface StatsResponse {
  totalRequests: number;
  avgDurationSeconds: number | null;
  byProvider: ProviderStat[];
}

// ===== Usage =====
export interface UsageRpmRow {
  provider: string;
  key_used: number;
  requests: number;
}

export interface UsageTpmByProvider {
  provider: string;
  tokens: number;
}

export interface UsageRateLimitEntry {
  provider: string;
  remainingRequests: number | null;
  remainingTokens: number | null;
  reportedAt: string;
}

export interface UsageByModel {
  model: string;
  rpm: { used: number; limit: number };
  tpm: { used: number; limit: number };
  rpd: { used: number; limit: number };
}

export interface UsageResponse {
  windowSeconds: number;
  rpm: UsageRpmRow[];
  tpm: { total: number; byProvider: UsageTpmByProvider[] };
  rateLimit: UsageRateLimitEntry[];
  byModel: UsageByModel[];
}