import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isLockConfigured, isUnlocked, lockApp, setUnlocked, sha256Hex, verifyPin } from './lock';

describe('lib/lock', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sha256Hex produces the known SHA-256 hash for a fixed input', async () => {
    // Known vector: sha256("1234") = 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
    const hash = await sha256Hex('1234');
    expect(hash).toBe('03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  });

  it('is not configured when no hash env var is set', () => {
    expect(isLockConfigured()).toBe(false);
  });

  it('is configured when a hash env var is set', () => {
    vi.stubEnv('VITE_APP_PIN_HASH', 'abc123');
    expect(isLockConfigured()).toBe(true);
  });

  it('verifyPin always succeeds when the lock is not configured — never blocks access with no PIN set', async () => {
    await expect(verifyPin('anything')).resolves.toBe(true);
  });

  it('verifyPin accepts the correct PIN and rejects a wrong one when configured', async () => {
    const correctHash = await sha256Hex('7331');
    vi.stubEnv('VITE_APP_PIN_HASH', correctHash);
    await expect(verifyPin('7331')).resolves.toBe(true);
    await expect(verifyPin('0000')).resolves.toBe(false);
  });

  it('unlock state persists across isUnlocked() calls until lockApp() clears it', () => {
    expect(isUnlocked()).toBe(false);
    setUnlocked();
    expect(isUnlocked()).toBe(true);
    lockApp();
    expect(isUnlocked()).toBe(false);
  });
});
