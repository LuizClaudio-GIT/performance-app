import { BLOCKS, DAILY_STATS } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { DumbbellIcon, PlayGlyph } from '../common/Icons';
import { ChecklistCard } from './ChecklistCard';
import { ComplementaryBlockCard } from './ComplementaryBlockCard';

export function HojeTab() {
  const { blockDone } = useAppState();
  const blocksDone = BLOCKS.filter((b) => blockDone[b.id]).length;

  return (
    <div className="pf-page">
      <div className="pf-hero">
        <div className="pf-hero-stripes" />
        <div className="pf-hero-fade" />
        <div className="pf-hero-tag">FOTO P&amp;B — ATLETA</div>
        <div className="pf-hero-body">
          <div className="pf-hero-date">
            SEGUNDA-FEIRA
            <br />
            21 DE SETEMBRO
          </div>
          <div className="pf-hero-title">HOJE</div>
          <div className="pf-underline" style={{ margin: 0, marginBottom: 12 }} />
          <div className="pf-hero-quote">&ldquo;Pequenas ações, grandes resultados.&rdquo;</div>
        </div>
      </div>

      <div className="pf-focus-card">
        <div className="pf-focus-eyebrow">
          <div className="pf-focus-dot" />
          <div className="pf-focus-label">FOCO DE HOJE</div>
        </div>
        <div className="pf-focus-title">MOBILIDADE + GINÁSTICA</div>
        <div className="pf-focus-tags">
          <span className="pf-tag pf-tag--accent">DORSIFLEXÃO</span>
          <span className="pf-tag pf-tag--accent">BASE HANDSTAND</span>
        </div>
        <div className="pf-focus-objective">
          <strong>Objetivo: </strong>
          melhorar a profundidade do agachamento e construir suporte de ombro para a parede.
        </div>
      </div>

      <div className="pf-section-head">
        <div className="pf-section-label">CONTEXTO — TREINO DO BOX</div>
        <div className="pf-section-count">NÃO PRESCRITO AQUI</div>
      </div>

      <div className="pf-box-card">
        <div className="pf-box-head">
          <div className="pf-box-icon">
            <DumbbellIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pf-box-name">CROSSFIT</div>
            <div className="pf-box-meta">07:00 — 08:00 · BOX PERFORMANCE</div>
          </div>
          <span className="pf-badge">EM BREVE</span>
        </div>
        <div className="pf-wod">
          <div className="pf-wod-body">
            <div className="pf-wod-label">WOD DO DIA</div>
            <div className="pf-wod-text">
              For time:
              <br />
              500 m Row
              <br />
              21 Thrusters (43/30)
              <br />
              15 Pull-ups
              <br />9 Burpees
            </div>
          </div>
          <div className="pf-wod-cta">
            <div className="pf-wod-play">
              <PlayGlyph />
            </div>
            <div className="pf-wod-cta-label">
              VER
              <br />
              DETALHES
            </div>
          </div>
        </div>
      </div>

      <div className="pf-section-head">
        <div className="pf-section-label pf-section-label--accent">DESENVOLVIMENTO COMPLEMENTAR</div>
        <div className="pf-section-count">{blocksDone}/3</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BLOCKS.map((b) => (
          <ComplementaryBlockCard key={b.id} block={b} />
        ))}
      </div>

      <ChecklistCard />

      <div className="pf-stats-grid">
        {DAILY_STATS.map((s) => (
          <div className="pf-stat-card" key={s.label}>
            <div className="pf-stat-label">{s.label}</div>
            <div className="pf-stat-value">{s.value}</div>
            <div className="pf-progress-track pf-progress-track--thin" style={{ marginTop: 9 }}>
              <div className="pf-progress-fill" style={{ width: `${s.pct}%` }} />
            </div>
            <div className="pf-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="pf-banner">
        <div className="pf-banner-stripes" />
        <div className="pf-banner-fade" />
        <div className="pf-banner-text">
          DISCIPLINA HOJE,
          <br />
          RESULTADOS AMANHÃ.
        </div>
      </div>
    </div>
  );
}
