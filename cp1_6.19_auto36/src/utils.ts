import { TECH_COLORS } from './types';

export function getTechColor(tech: string): string {
  return TECH_COLORS[tech] || '#64748B';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`;
  return `${Math.floor(diffDay / 365)}年前`;
}

export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const monthStart = getMonthStart();
  return date >= monthStart;
}

export function renderMarkdown(text: string): string {
  let result = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  const lines = result.split('\n');
  const processed: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        processed.push('<ul>');
        inList = true;
      }
      processed.push(`<li>${line.replace(/^\s*[-*]\s+/, '')}</li>`);
    } else {
      if (inList) {
        processed.push('</ul>');
        inList = false;
      }
      if (line.trim()) {
        processed.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) {
    processed.push('</ul>');
  }

  return processed.join('\n');
}

export function getAllTechTags(): string[] {
  return Object.keys(TECH_COLORS);
}
