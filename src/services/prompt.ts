import type { Lang, Tab } from '../types';

export function buildPrompt(text: string, tab: Tab, lang: Lang): string {
  if (tab === 'spell') {
    return `Bạn là chuyên gia kiểm tra chính tả tiếng Việt. Hãy kiểm tra đoạn văn sau:

"${text}"

Yêu cầu:
1. Chỉ liệt kê các lỗi chính tả thực sự theo dạng "từ sai → từ đúng".
2. Nếu không có lỗi, chỉ trả lời: "Không phát hiện lỗi chính tả."
3. Nếu có lỗi, sau danh sách lỗi hãy trả lại toàn bộ văn bản đã sửa.
4. Không tự tạo lỗi khi văn bản đã đúng.

Trả lời ngắn gọn, rõ ràng bằng tiếng Việt.`;
  }

  if (lang === 'vi-en') {
    return `Translate the complete Vietnamese text below into natural English.
Return only the translation. Do not summarize, omit, explain, or add notes.

Text:
${text}`;
  }

  return `Dịch toàn bộ văn bản tiếng Anh dưới đây sang tiếng Việt tự nhiên.
Chỉ trả về bản dịch. Không tóm tắt, bỏ sót, giải thích hoặc thêm chú thích.

Văn bản:
${text}`;
}
