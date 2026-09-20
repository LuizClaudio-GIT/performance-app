import { MEASURES, METRICS, PROGRESSIONS } from '../../data/mockData';
import type { EvoTabId } from '../../types';
import { useAppState } from '../../state/AppState';
import { StepTimeline } from '../common/StepTimeline';

const EVO_TABS: { id: EvoTabId; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'medidas', label: 'Medidas' },
  { id: 'progressoes', label: 'Progressões' },
];

function sparkPoints(data: number[]) {
  return data.map((y, i) => `${(i / (data.length - 1)) * 100},${30 - y * 26}`).join(' ');
}

export function EvolucaoTab() {
  const { evoTab, setEvoTab } = useAppState();

  return (
    <div className="pf-page">
      <div className="pf-page-header">
        <div className="pf-page-title">EVOLUÇÃO</div>
        <div className="pf-page-eyebrow">
          DADOS
          <br />
          GERAM
          <br />
          DIREÇÃO
        </div>
      </div>
      <div className="pf-underline" style={{ marginBottom: 16 }} />

      <div className="pf-segmented" style={{ marginBottom: 16 }}>
        {EVO_TABS.map((t) => (
          <button key={t.id} className="pf-pill" data-active={evoTab === t.id} onClick={() => setEvoTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {evoTab === 'resumo' && (
        <div className="pf-metrics-grid">
          {METRICS.map((m) => (
            <div className="pf-metric-card" key={m.name}>
              <div className="pf-metric-name">{m.name}</div>
              <div className="pf-metric-value">{m.value}</div>
              <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                <polyline points={sparkPoints(m.data)} fill="none" stroke="var(--pf-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="pf-metric-foot">
                <span className="pf-metric-base">base {m.base}</span>
                <span className="pf-metric-delta">{m.delta}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {evoTab === 'progressoes' && (
        <div className="pf-progressions-list">
          {PROGRESSIONS.map((p) => (
            <div className="pf-progression-card" key={p.name}>
              <div className="pf-progression-head">
                <div className="pf-progression-name">{p.name}</div>
                <div className="pf-progression-stage">{p.stageLabel}</div>
              </div>
              <div className="pf-progression-note">{p.note}</div>
              <div className="pf-progression-steps">
                <StepTimeline steps={p.steps} current={p.current} />
              </div>
            </div>
          ))}
        </div>
      )}

      {evoTab === 'medidas' && (
        <div className="pf-measures-list">
          {MEASURES.map((m) => (
            <div className="pf-measure-row" key={m.name}>
              <div className="pf-measure-name">{m.name}</div>
              <div className="pf-measure-base">{m.base}</div>
              <div className="pf-measure-now">{m.now}</div>
              <div className="pf-measure-delta">{m.delta}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
