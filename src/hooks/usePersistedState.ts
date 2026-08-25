import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function readValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // JSON hỏng hoặc localStorage không khả dụng -> dùng giá trị mặc định.
    return fallback;
  }
}

/**
 * useState nhưng tự động đồng bộ giá trị vào localStorage theo `key`.
 * Dùng để giữ lại tab, ngôn ngữ, danh sách API key... giữa các lần reload.
 */
export function usePersistedState<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readValue(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Có thể bị chặn ở chế độ ẩn danh hoặc hết dung lượng - bỏ qua, không làm crash app.
    }
  }, [key, value]);

  return [value, setValue];
}