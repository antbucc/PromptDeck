// src/utils/download.ts
import { jsPDF } from 'jspdf';

// Sanitize a string into a safe file name (no slashes, spaces collapsed).
export const safeFileName = (name: string, fallback = 'output'): string => {
  const cleaned = (name || '').trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
  return cleaned || fallback;
};

// Trigger a browser download for an arbitrary Blob.
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Download plain text / markdown as a file.
export const downloadText = (filename: string, text: string, mime = 'text/plain') => {
  triggerDownload(new Blob([text], { type: mime }), filename);
};

// Download a data: URI (e.g. data:audio/wav;base64,....) as a binary file.
export const downloadDataUri = (filename: string, dataUri: string) => {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const FORMAT_META: Record<string, { ext: string; mime: string }> = {
  markdown: { ext: 'md', mime: 'text/markdown' },
  text: { ext: 'txt', mime: 'text/plain' },
  json: { ext: 'json', mime: 'application/json' },
  csv: { ext: 'csv', mime: 'text/csv' },
};

// Download an image (URL) — fetch to a blob when CORS allows, else open it.
export const downloadImage = async (base: string, url: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const ext = (blob.type.split('/')[1] || 'jpg').split('+')[0];
    triggerDownload(blob, `${safeFileName(base)}.${ext}`);
  } catch {
    window.open(url, '_blank');
  }
};

// Export text/markdown content as a PDF (client-side).
export const downloadOutputPdf = (title: string, text: string) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageH = doc.internal.pageSize.getHeight() - margin;
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(text || '', width) as string[];
  let y = margin;
  for (const line of lines) {
    if (y > pageH) { doc.addPage(); y = margin; }
    doc.text(line, margin, y);
    y += 15;
  }
  doc.save(`${safeFileName(title, 'card-output')}.pdf`);
};

// Smart download for a card's output, respecting its declared format.
export const downloadCardOutput = (title: string, output: string, outputFormat?: string) => {
  if (!output) return;
  const base = safeFileName(title, 'card-output');
  const trimmed = output.trim();

  if (outputFormat === 'image' || /^https?:\/\/image\.pollinations\.ai/.test(trimmed)) {
    downloadImage(base, trimmed);
    return;
  }
  if (/^data:/i.test(trimmed)) {
    const match = trimmed.match(/^data:([^;,]+)/i);
    const subtype = match ? match[1].split('/')[1] : 'bin';
    downloadDataUri(`${base}.${subtype || 'bin'}`, trimmed);
    return;
  }
  const meta = FORMAT_META[outputFormat || 'markdown'] || FORMAT_META.markdown;
  downloadText(`${base}.${meta.ext}`, output, meta.mime);
};
