export class DeepSeekApiError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'DeepSeekApiError';
    this.status = status;
    this.retryable = status === 408 || status === 429 || status >= 500;
  }
}

export async function callDeepSeek(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error('Chưa nhập DeepSeek API Key');

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash-0731',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    let message = 'Lỗi DeepSeek API';
    try {
      const err = await res.json();
      message = err.error?.message ?? message;
    } catch {
      // Giữ message mặc định nếu response không phải JSON.
    }
    throw new DeepSeekApiError(message, res.status);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new DeepSeekApiError('DeepSeek không trả về nội dung.', 502);
  return (text as string).trim();
}