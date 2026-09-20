import { useAppState } from '../../state/AppState';
import type { TabId } from '../../types';

const NAV: { id: TabId; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'food', label: 'Alimentação' },
  { id: 'evo', label: 'Evolução' },
  { id: 'mais', label: 'Mais' },
];

export function BottomNav() {
  const { tab, setTab } = useAppState();

  return (
    <nav className="pf-bottom-nav" aria-label="Navegação principal">
      {NAV.map((n) => {
        const active = tab === n.id;
        return (
          <button
            key={n.id}
            className="pf-nav-btn"
            data-active={active}
            onClick={() => setTab(n.id)}
            aria-current={active ? 'page' : undefined}
          >
            <div className={`pf-nav-icon${n.id === 'mais' ? ' pf-nav-icon--round' : ''}`} />
            <span className="pf-nav-label">{n.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
