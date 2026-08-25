export class GeminiApiError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiApiError';
    this.status = status;
    this.retryable = status === 408 || status === 429 || status >= 500;
  }
}

export async function callGemini(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error('Chưa có Gemini API key.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25 },
    }),
  });

  if (!res.ok) {
    let message = 'Gemini không thể xử lý yêu cầu.';
    try {
      const data = await res.json();
      message = data.error?.message ?? message;
    } catch {
      // Keep the friendly fallback when the response has no JSON body.
    }
    throw new GeminiApiError(message, res.status);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? '')
    .join('')
    .trim();

  if (!text) throw new GeminiApiError('Gemini không trả về nội dung.', 502);
  return text;
}
