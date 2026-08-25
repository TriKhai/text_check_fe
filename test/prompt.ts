import type { Lang, Tab } from "../types";

export function buildPrompt(text: string, tab: Tab, lang: Lang): string {
    if (tab === 'spell') {
        return `Bạn là chuyên gia kiểm tra chính tả tiếng Việt. Hãy kiểm tra đoạn văn sau:

            "${text}"

            Yêu cầu:
            1. Chỉ liệt kê các lỗi chính tả THỰC SỰ (từ sai -> từ đúng). Nếu không có lỗi, ghi "Không phát hiện lỗi chính tả." và dừng lại.
            2. Nếu có lỗi, sữa lỗi lại văn bản đã chỉnh sữa sau đó trả lại văn bản đó.
            3. KHÔNG được bịa ra lỗi nếu văn bản đã đúng.

        Trả lời ngắn gọn, rõ ràng bằng tiếng Việt.`;
    }

    if (lang === 'vi-en') {
        return `Dịch đoạn văn sau từ tiếng Việt sang tiếng Anh. Chỉ trả về bản dịch, không giải thích:\n\n"${text}"`;
    }

    return `Translate the following text from English to Vietnamese. Only return the translation, no explanation:\n\n"${text}"`;
}