const UNLOCK_KEY = 'performance:unlocked';

/**
 * Deterrent, not real security: the app is a static site with public source,
 * so the hash is reachable in the built bundle by anyone who looks. This only
 * keeps a casual visitor with the link from opening the app — see CLAUDE.md.
 */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isLockConfigured(): boolean {
  return !!import.meta.env.VITE_APP_PIN_HASH;
}

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function setUnlocked(): void {
  try {
    localStorage.setItem(UNLOCK_KEY, '1');
  } catch {
    // ignore — worst case, asks again next load
  }
}

export function lockApp(): void {
  try {
    localStorage.removeItem(UNLOCK_KEY);
  } catch {
    // ignore
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  const expected = import.meta.env.VITE_APP_PIN_HASH;
  if (!expected) return true;
  const hash = await sha256Hex(pin);
  return hash.toLowerCase() === expected.toLowerCase();
}
