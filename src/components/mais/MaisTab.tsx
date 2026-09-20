import { LIMITATIONS, MORE_LINKS, PROFILE } from '../../data/mockData';
import { useAppState } from '../../state/AppState';

export function MaisTab() {
  const { setTab, setEvoTab } = useAppState();

  return (
    <div className="pf-page">
      <div className="pf-page-header">
        <div className="pf-page-title">MAIS</div>
        <div className="pf-page-eyebrow">
          O SEU
          <br />
          PROCESSO
        </div>
      </div>
      <div className="pf-underline" />

      <div className="pf-profile-card">
        <div className="pf-profile-photo pf-placeholder">
          <span className="pf-placeholder-label">FOTO</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pf-profile-name">{PROFILE.name}</div>
          <div className="pf-profile-meta">{PROFILE.meta}</div>
        </div>
        <span className="pf-badge">{PROFILE.status}</span>
      </div>

      <div className="pf-pair-grid">
        <div className="pf-pair-card">
          <div className="pf-pair-label">SESSÕES COMPLEMENTARES</div>
          <div className="pf-pair-value">{PROFILE.sessionsCount}</div>
        </div>
        <div className="pf-pair-card">
          <div className="pf-pair-label">SEQUÊNCIA ATUAL</div>
          <div className="pf-pair-value" style={{ color: 'var(--pf-accent)' }}>
            {PROFILE.streakDays} dias
          </div>
        </div>
      </div>

      <div className="pf-section-label" style={{ margin: '20px 2px 9px' }}>
        MINHAS LIMITAÇÕES
      </div>
      <div className="pf-limitations-list">
        {LIMITATIONS.map((l) => (
          <div className="pf-limitation-row" key={l.area}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pf-limitation-area">{l.area}</div>
              <div className="pf-limitation-note">{l.note}</div>
            </div>
            <div className="pf-limitation-bar-wrap">
              <div className="pf-progress-track pf-progress-track--thinner">
                <div className="pf-progress-fill" style={{ width: `${l.pct}%` }} />
              </div>
              <div className="pf-limitation-pct">{l.pct}%</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pf-section-label" style={{ margin: '20px 2px 9px' }}>
        ATALHOS
      </div>
      <div className="pf-shortcuts-list">
        {MORE_LINKS.map((m) => (
          <button
            className="pf-shortcut-row"
            key={m.label}
            onClick={() => {
              if (!m.go) return;
              setTab(m.go);
              if (m.go === 'evo') setEvoTab('progressoes');
            }}
          >
            <div className="pf-shortcut-label">{m.label}</div>
            <div className="pf-shortcut-hint">{m.hint}</div>
            <div className="pf-shortcut-chevron">›</div>
          </button>
        ))}
      </div>

      <div className="pf-quote-banner">
        MAIS QUE UM APP.
        <br />
        É O SEU PROCESSO.
      </div>
    </div>
  );
}
