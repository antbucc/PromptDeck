// src/utils/download.ts

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

// Smart download for a card's textual output: if it is a data: URI download it
// as a binary, otherwise save it as a Markdown file named after the card.
export const downloadCardOutput = (title: string, output: string) => {
  if (!output) return;
  const base = safeFileName(title, 'card-output');
  if (/^data:/i.test(output.trim())) {
    // Best-effort extension from the mime type in the data URI.
    const match = output.match(/^data:([^;,]+)/i);
    const subtype = match ? match[1].split('/')[1] : 'bin';
    downloadDataUri(`${base}.${subtype || 'bin'}`, output.trim());
  } else {
    downloadText(`${base}.md`, output, 'text/markdown');
  }
};
