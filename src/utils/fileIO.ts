import mammoth from 'mammoth';
import { BorderStyle, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Worker cho pdf.js — tải qua CDN để không phụ thuộc cấu hình bundler.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Dọn dẹp text vừa trích xuất từ docx/pdf: gộp nhiều dấu cách liên tiếp thành 1,
 * bỏ khoảng trắng cuối dòng, và gộp nhiều dòng trống liên tiếp thành tối đa 1 dòng trống.
 * (mammoth/pdf.js hay sinh dư khoảng trắng/dòng trống do cách ghép đoạn văn/mảnh chữ.)
 */
function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n') // chuẩn hoá xuống dòng kiểu Windows/Mac về \n
    .replace(/[ \t]+/g, ' ') // gộp nhiều dấu cách/tab liên tiếp thành 1
    .replace(/[ \t]+\n/g, '\n') // bỏ khoảng trắng cuối mỗi dòng
    .replace(/\n{3,}/g, '\n\n') // gộp 3+ dòng trống liên tiếp thành 1 dòng trống
    .trim();
}

/** Trích text từ PDF (chỉ đọc được PDF có lớp văn bản thật, không OCR ảnh scan). */
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }

  const text = normalizeExtractedText(pageTexts.join('\n\n'));
  if (!text) {
    throw new Error('Không tìm thấy văn bản trong PDF (có thể là file scan/ảnh, cần OCR).');
  }
  return text;
}

/**
 * Đọc nội dung văn bản từ file .txt, .docx hoặc .pdf do người dùng chọn.
 * Ném lỗi (Error) nếu định dạng không được hỗ trợ hoặc đọc thất bại.
 */
export async function readTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return normalizeExtractedText(value);
  }

  if (ext === 'pdf') {
    return await extractTextFromPdf(file);
  }

  if (ext === 'txt' || file.type.startsWith('text/')) {
    return await file.text();
  }

  throw new Error('Chỉ hỗ trợ file .txt, .docx hoặc .pdf.');
}

/** Tải blob xuống máy người dùng với tên file chỉ định. */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Bỏ ký hiệu markdown (#, **, ---...) để trả về text sạch, dễ đọc. */
function stripMarkdown(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => {
      if (line.trim() === '---') return '';
      let cleaned = line.replace(/^#{1,6}\s+/, ''); // bỏ # tiêu đề
      cleaned = cleaned.replace(/^[*-]\s+/, '- '); // chuẩn hoá gạch đầu dòng
      cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1'); // bỏ **đậm**
      cleaned = cleaned.replace(/\*(.+?)\*/g, '$1'); // bỏ *nghiêng*
      return cleaned;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Xuất văn bản (markdown) ra file .txt sạch, đã bỏ ký hiệu markdown, và tải xuống. */
export function downloadAsTxt(markdown: string, filename = 'ket-qua.txt') {
  const blob = new Blob([stripMarkdown(markdown)], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename);
}

/** Tách 1 dòng thành các đoạn chữ thường/đậm dựa trên **...** */
function parseInlineRuns(line: string): TextRun[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);
  if (parts.length === 0) return [new TextRun('')];
  return parts.map((part) =>
    part.startsWith('**') && part.endsWith('**')
      ? new TextRun({ text: part.slice(2, -2), bold: true })
      : new TextRun(part),
  );
}

/** Chuyển text markdown (#, ##, ###, **đậm**, gạch đầu dòng, ---) thành các Paragraph của docx. */
function markdownToDocxParagraphs(markdown: string): Paragraph[] {
  const lines = markdown.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    if (line.trim() === '---') {
      paragraphs.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
          spacing: { before: 120, after: 120 },
        }),
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading =
        level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
      paragraphs.push(
        new Paragraph({ heading, spacing: { before: 200, after: 100 }, children: parseInlineRuns(headingMatch[2]) }),
      );
      continue;
    }

    const bulletMatch = line.match(/^[*-]\s+(.*)$/);
    if (bulletMatch) {
      paragraphs.push(
        new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: parseInlineRuns(bulletMatch[1]) }),
      );
      continue;
    }

    paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: parseInlineRuns(line) }));
  }

  return paragraphs;
}

/** Xuất văn bản (markdown) ra file .docx (Word) với tiêu đề/chữ đậm/danh sách được định dạng thật, rồi tải xuống. */
export async function downloadAsDocx(markdown: string, filename = 'ket-qua.docx') {
  const paragraphs = markdownToDocxParagraphs(markdown);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph('')],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, filename);
}