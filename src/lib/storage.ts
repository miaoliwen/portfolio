const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /credential/i,
  /auth/i,
  /session/i,
  /ssn/i,
  /social.?security/i,
  /credit.?card/i,
  /cvv/i,
  /pin/i,
];

const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024;

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
}

function isSensitiveValue(value: string): boolean {
  if (value.length > 200) return true;
  if (/^(sk-|pk-|ghp_|xoxb-|Bearer\s)/i.test(value)) return true;
  if (/^[A-Za-z0-9+/]{40,}={0,2}$/.test(value.trim())) return true;
  return false;
}

function getStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += key.length + (localStorage.getItem(key) || "").length;
    }
  }
  return total;
}

export function safeSetItem(key: string, value: string): void {
  if (isSensitiveKey(key)) {
    console.warn(`[Storage] Refusing to store sensitive key: ${key}`);
    return;
  }
  if (isSensitiveValue(value)) {
    console.warn(`[Storage] Refusing to store potentially sensitive value for key: ${key}`);
    return;
  }
  try {
    if (getStorageSize() + key.length + value.length > MAX_STORAGE_SIZE) {
      console.warn("[Storage] Storage quota approaching, cleaning up expired entries");
      cleanupExpired();
    }
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.error("[Storage] Quota exceeded, performing emergency cleanup");
      cleanupExpired();
      cleanupOldest();
    }
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    console.warn(`[Storage] Failed to read key: ${key}`);
    return null;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`[Storage] Failed to remove key: ${key}`);
  }
}

export function safeParseJSON<T>(key: string, fallback: T): T {
  const raw = safeGetItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[Storage] Invalid JSON for key: ${key}, using fallback`);
    safeRemoveItem(key);
    return fallback;
  }
}

export function safeSetJSON(key: string, value: unknown): void {
  try {
    const serialized = JSON.stringify(value);
    safeSetItem(key, serialized);
  } catch {
    console.warn(`[Storage] Failed to serialize value for key: ${key}`);
  }
}

export function setWithExpiry(key: string, value: string, ttlMs: number): void {
  const item = JSON.stringify({
    v: value,
    exp: Date.now() + ttlMs,
  });
  safeSetItem(key, item);
}

export function getWithExpiry(key: string): string | null {
  const raw = safeGetItem(key);
  if (raw === null) return null;
  try {
    const item = JSON.parse(raw);
    if (Date.now() > item.exp) {
      safeRemoveItem(key);
      return null;
    }
    return item.v;
  } catch {
    safeRemoveItem(key);
    return null;
  }
}

export function cleanupExpired(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      const parsed = JSON.parse(raw);
      if (parsed.exp && Date.now() > parsed.exp) {
        keysToRemove.push(key);
      }
    } catch {
      // not a JSON with expiry, skip
    }
  }
  keysToRemove.forEach((key) => safeRemoveItem(key));
  if (keysToRemove.length > 0) {
    console.log(`[Storage] Cleaned up ${keysToRemove.length} expired entries`);
  }
}

export function cleanupOldest(): void {
  const entries: { key: string; size: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || "";
    entries.push({ key, size: key.length + value.length });
  }
  entries.sort((a, b) => b.size - a.size);
  const toRemove = entries.slice(0, Math.ceil(entries.length / 3));
  toRemove.forEach(({ key }) => safeRemoveItem(key));
  if (toRemove.length > 0) {
    console.log(`[Storage] Emergency cleanup: removed ${toRemove.length} largest entries`);
  }
}

export function clearAll(): void {
  try {
    localStorage.clear();
    console.log("[Storage] All local storage cleared");
  } catch {
    console.warn("[Storage] Failed to clear local storage");
  }
}

export function getStorageReport(): {
  totalSize: string;
  entryCount: number;
  entries: { key: string; size: string; valuePreview: string }[];
} {
  const entries: { key: string; size: string; valuePreview: string }[] = [];
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || "";
    const size = key.length + value.length;
    totalSize += size;
    entries.push({
      key,
      size: `${(size / 1024).toFixed(1)} KB`,
      valuePreview: value.slice(0, 50) + (value.length > 50 ? "..." : ""),
    });
  }
  return {
    totalSize: `${(totalSize / 1024).toFixed(1)} KB`,
    entryCount: entries.length,
    entries,
  };
}
