/** Browser storage for the mock API. A real backend replaces all of this. */
const PREFIX = 'bayan-app:';
const mem = new Map<string, string>();

function raw(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function read<T>(key: string, fallback: T): T {
  const s = raw();
  const v = s ? s.getItem(PREFIX + key) : mem.get(key) ?? null;
  if (v == null) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  const v = JSON.stringify(value);
  const s = raw();
  try {
    if (s) s.setItem(PREFIX + key, v);
    else mem.set(key, v);
  } catch {
    mem.set(key, v);
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const now = () => new Date().toISOString();
/** Simulated network latency so loading states are exercised. */
export const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));
