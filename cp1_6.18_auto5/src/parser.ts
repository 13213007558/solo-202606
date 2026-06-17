import Papa from 'papaparse';

export type ColumnType = 'number' | 'date' | 'text' | 'boolean';

export interface DataFrame {
  columns: string[];
  rows: Record<string, unknown>[];
  filename: string;
  rowCount: number;
  colCount: number;
}

type FileFormat = 'csv' | 'json';

function detectFormat(filename: string): FileFormat {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'json') return 'json';
  throw new Error('不支持的文件格式，仅支持 CSV 和 JSON');
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function parseCSV(text: string): Record<string, unknown>[] {
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: 'greedy',
    transform: (value: string) => {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }
  });

  if (result.errors.length > 0) {
    const fatal = result.errors.filter((e: Papa.ParseError) => e.type === 'FieldMismatch' || e.type === 'Quotes');
    if (fatal.length > 0) {
      console.warn('CSV解析警告:', fatal.slice(0, 5));
    }
  }

  return result.data;
}

function parseJSON(text: string): Record<string, unknown>[] {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return [];
    if (typeof parsed[0] === 'object' && parsed[0] !== null && !Array.isArray(parsed[0])) {
      return parsed as Record<string, unknown>[];
    }
    throw new Error('JSON 数组必须包含对象');
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return [parsed as Record<string, unknown>];
  }
  throw new Error('JSON 格式不正确，必须是对象或对象数组');
}

export async function parseFile(file: File): Promise<DataFrame> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('文件过大，最大支持 10MB');
  }

  const format = detectFormat(file.name);
  const text = await readFileAsText(file);

  let rows: Record<string, unknown>[];
  if (format === 'csv') {
    rows = parseCSV(text);
  } else {
    rows = parseJSON(text);
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const normalizedRows = rows.map(row => {
    const normalized: Record<string, unknown> = {};
    for (const col of columns) {
      const val = row[col];
      if (val === undefined || val === '' || val === null) {
        normalized[col] = null;
      } else {
        normalized[col] = val;
      }
    }
    return normalized;
  });

  return {
    columns,
    rows: normalizedRows,
    filename: file.name,
    rowCount: normalizedRows.length,
    colCount: columns.length
  };
}
