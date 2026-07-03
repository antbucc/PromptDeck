// src/utils/fileText.ts
import * as XLSX from 'xlsx';

// Extract plain text from a supported document (CSV/TSV/TXT/JSON/MD or Excel).
export const extractText = async (file: File): Promise<string> => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    return wb.SheetNames.map((n) => `# Sheet: ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`).join('\n\n');
  }
  return await file.text();
};

export interface Attachment { name: string; text: string; }

// Parse a list of files into { name, text } attachments (best-effort).
export const filesToAttachments = async (files: File[]): Promise<Attachment[]> => {
  const out: Attachment[] = [];
  for (const f of files) {
    try {
      out.push({ name: f.name, text: (await extractText(f)).trim() });
    } catch {
      /* skip unreadable files */
    }
  }
  return out;
};
