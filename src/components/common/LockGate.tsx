import { useState, type FormEvent, type ReactNode } from 'react';
import { isLockConfigured, isUnlocked, setUnlocked, verifyPin } from '../../lib/lock';

export function LockGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlockedState] = useState(() => !isLockConfigured() || isUnlocked());
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (unlocked) return <>{children}</>;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    const ok = await verifyPin(pin);
    setChecking(false);
    if (ok) {
      setUnlocked();
      setUnlockedState(true);
    } else {
      setError(true);
      setPin('');
    }
  }

  return (
    <div className="pf-lock-overlay">
      <form className="pf-lock-card" onSubmit={handleSubmit}>
        <div className="pf-lock-title">PERFORMANCE</div>
        <div className="pf-lock-label">Digite o PIN para entrar</div>
        <input
          autoFocus
          className="pf-input pf-lock-input"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          placeholder="••••"
        />
        {error && <div className="pf-lock-error">PIN incorreto.</div>}
        <button className="pf-btn-primary" style={{ padding: 12 }} type="submit" disabled={!pin || checking}>
          {checking ? 'VERIFICANDO…' : 'ENTRAR'}
        </button>
      </form>
    </div>
  );
}
