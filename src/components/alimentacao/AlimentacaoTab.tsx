import { KCAL_GOAL, KCAL_NOW, KCAL_NOW_VALUE, MACROS, MEALS, WATER_GOAL } from '../../data/mockData';
import { useAppState } from '../../state/AppState';

const RADIUS = 44;
const CIRC = 2 * Math.PI * RADIUS;

export function AlimentacaoTab() {
  const { mealsDone, toggleMeal, water, addWater } = useAppState();
  const pct = Math.min(1, KCAL_NOW_VALUE / KCAL_GOAL);
  const dash = `${Math.round(CIRC * pct)} ${Math.round(CIRC)}`;
  const waterLabel = `${water.toFixed(1).replace('.', ',')} L`;
  const waterPct = Math.min(100, (water / WATER_GOAL) * 100);

  return (
    <div className="pf-page">
      <div className="pf-page-header">
        <div className="pf-page-title">
          ALIMEN-
          <br />
          TAÇÃO
        </div>
        <div className="pf-page-eyebrow">
          COMBUSTÍVEL
          <br />
          PARA EVOLUIR
        </div>
      </div>
      <div className="pf-underline" />

      <div className="pf-kcal-card">
        <div className="pf-kcal-ring">
          <svg width="104" height="104" viewBox="0 0 104 104">
            <circle cx="52" cy="52" r={RADIUS} fill="none" stroke="var(--pf-border-soft)" strokeWidth="9" />
            <circle
              cx="52"
              cy="52"
              r={RADIUS}
              fill="none"
              stroke="var(--pf-accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={dash}
              transform="rotate(-90 52 52)"
            />
          </svg>
          <div className="pf-kcal-ring-center">
            <div className="pf-kcal-now">{KCAL_NOW}</div>
            <div className="pf-kcal-goal">/ 1.900 kcal</div>
          </div>
        </div>
        <div className="pf-macros">
          {MACROS.map((m) => (
            <div key={m.name}>
              <div className="pf-macro-row">
                <span className="pf-macro-name">{m.name}</span>
                <span className="pf-macro-val">{m.val}</span>
              </div>
              <div className="pf-progress-track pf-progress-track--thinner" style={{ marginTop: 6 }}>
                <div className="pf-progress-fill" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pf-section-label" style={{ margin: '20px 2px 9px' }}>
        PLANO DO DIA
      </div>
      <div className="pf-meals-list">
        {MEALS.map((m) => {
          const on = mealsDone[m.id];
          return (
            <div
              className="pf-meal-row"
              key={m.id}
              style={{
                border: `1px solid ${on ? 'rgba(198,255,0,.28)' : 'var(--pf-border)'}`,
                background: on ? 'rgba(198,255,0,.04)' : 'var(--pf-surface)',
              }}
            >
              <div className="pf-meal-photo pf-placeholder">
                <span className="pf-placeholder-label">FOTO</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pf-meal-name">{m.name}</div>
                <div className="pf-meal-meta">
                  {m.time} · {m.kcal} kcal · P {m.prot}
                </div>
                <div className="pf-meal-items">{m.items}</div>
              </div>
              <button
                className="pf-meal-toggle"
                style={{
                  border: `1.5px solid ${on ? 'var(--pf-accent)' : '#3A3F45'}`,
                  background: on ? 'var(--pf-accent)' : 'transparent',
                }}
                onClick={() => toggleMeal(m.id)}
                aria-label={on ? `Desmarcar ${m.name}` : `Marcar ${m.name} como feita`}
              >
                {on ? '✓' : ''}
              </button>
            </div>
          );
        })}
      </div>

      <div className="pf-water-card">
        <div style={{ flex: 1 }}>
          <div className="pf-water-head">
            <span style={{ fontSize: 13, fontWeight: 600 }}>Água</span>
            <span style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 10, color: 'var(--pf-text-secondary)' }}>
              {waterLabel} / 3,5 L
            </span>
          </div>
          <div className="pf-progress-track" style={{ marginTop: 9 }}>
            <div className="pf-progress-fill" style={{ width: `${waterPct}%` }} />
          </div>
        </div>
        <button className="pf-water-add" onClick={addWater} aria-label="Adicionar água">
          +
        </button>
      </div>
    </div>
  );
}
