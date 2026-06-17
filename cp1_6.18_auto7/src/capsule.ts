import { generateId } from './utils';

export interface Capsule {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  createdAt: number;
  unlockAt: number;
}

export interface CreateCapsuleInput {
  title: string;
  content: string;
  imageUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  unlockAt: number;
}

const STORAGE_KEY = 'time_capsules_v1';

function readStorage(): Capsule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Capsule[];
  } catch {
    return [];
  }
}

function writeStorage(capsules: Capsule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
  } catch (e) {
    console.error('Failed to save capsules:', e);
    throw new Error('存储空间不足，请删除部分胶囊后重试');
  }
}

export function createCapsule(input: CreateCapsuleInput): Capsule {
  if (!input.title.trim()) {
    throw new Error('请输入胶囊标题');
  }
  if (!input.content.trim()) {
    throw new Error('请输入胶囊正文内容');
  }
  if (input.unlockAt <= Date.now()) {
    throw new Error('解锁时间必须是未来时间');
  }

  const capsule: Capsule = {
    id: generateId(),
    title: input.title.trim(),
    content: input.content.trim(),
    imageUrl: input.imageUrl || undefined,
    audioBase64: input.audioBase64 || undefined,
    audioMimeType: input.audioMimeType || undefined,
    createdAt: Date.now(),
    unlockAt: input.unlockAt,
  };

  const all = readStorage();
  all.unshift(capsule);
  writeStorage(all);
  return capsule;
}

export function getAllCapsules(): Capsule[] {
  return readStorage().sort((a, b) => b.createdAt - a.createdAt);
}

export function getCapsuleById(id: string): Capsule | null {
  return readStorage().find((c) => c.id === id) || null;
}

export function deleteCapsule(id: string): boolean {
  const all = readStorage();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  writeStorage(filtered);
  return true;
}

export function isUnlocked(capsule: Capsule): boolean {
  return Date.now() >= capsule.unlockAt;
}

export function getShareUrl(id: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/capsule/${id}`;
}
