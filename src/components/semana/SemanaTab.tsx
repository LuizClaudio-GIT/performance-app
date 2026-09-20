import { WEEK } from '../../data/mockData';
import type { WorkKind } from '../../types';

const WORK_COLOR: Record<WorkKind, string> = {
  done: 'var(--pf-accent)',
  today: 'var(--pf-accent)',
  next: 'var(--pf-text)',
  rest: 'var(--pf-text-secondary)',
};

const WORK_BG: Record<WorkKind, string> = {
  done: 'rgba(198,255,0,.10)',
  today: 'rgba(198,255,0,.14)',
  next: 'transparent',
  rest: 'transparent',
};

export function SemanaTab() {
  return (
    <div className="pf-page">
      <div className="pf-page-header">
        <div className="pf-page-title">
          MINHA
          <br />
          SEMANA
        </div>
        <div className="pf-page-eyebrow">
          CONSISTÊNCIA
          <br />
          GERA
          <br />
          RESULTADOS
        </div>
      </div>
      <div className="pf-underline" />

      <div className="pf-volume-card">
        <div className="pf-volume-head">
          <div className="pf-section-label">VOLUME COMPLEMENTAR</div>
          <div className="pf-volume-value">62%</div>
        </div>
        <div className="pf-progress-track" style={{ marginTop: 10 }}>
          <div className="pf-progress-fill" style={{ width: '62%' }} />
        </div>
        <div className="pf-volume-foot">
          <span>5 DE 8 SESSÕES</span>
          <span>META SEMANAL</span>
        </div>
      </div>

      <div className="pf-week-list">
        {WEEK.map((d) => {
          const today = d.state === 'HOJE';
          return (
            <div
              className="pf-week-row"
              key={d.day}
              style={{
                border: `1px solid ${today ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
                background: d.state === 'DESCANSO' ? 'var(--pf-surface-muted)' : 'var(--pf-surface)',
              }}
            >
              <div
                className="pf-week-day"
                style={{
                  background: today ? 'var(--pf-accent-soft)' : 'transparent',
                  color: today ? 'var(--pf-accent)' : 'var(--pf-text)',
                }}
              >
                <div className="pf-week-day-num">{d.day}</div>
                <div className="pf-week-day-date">{d.date}</div>
              </div>
              <div className="pf-week-body">
                <div className="pf-week-box">BOX · {d.box}</div>
                <div className="pf-week-work">
                  {d.work.map((w) => (
                    <span
                      className="pf-week-work-tag"
                      key={w.label}
                      style={{
                        border: `1px solid ${w.kind === 'today' ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
                        background: WORK_BG[w.kind],
                        color: WORK_COLOR[w.kind],
                      }}
                    >
                      {w.label}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="pf-week-state"
                style={{
                  color: d.state === 'CONCLUÍDO' || d.state === 'HOJE' ? 'var(--pf-accent)' : 'var(--pf-text-secondary)',
                }}
              >
                {d.state}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pf-quote-banner">
        PEQUENAS AÇÕES,
        <br />
        GRANDES RESULTADOS.
      </div>
    </div>
  );
}
