import { useState } from 'react';
import { getProgressionDef } from '../../data/catalog';
import { formatDecimal } from '../../lib/date';
import type { EvoTabId } from '../../types';
import { useAppState } from '../../state/AppState';
import { metricSeriesByName, weightSeries } from '../../state/logic';
import { StepTimeline } from '../common/StepTimeline';
import { AddMetricModal } from './AddMetricModal';

const EVO_TABS: { id: EvoTabId; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'medidas', label: 'Medidas' },
  { id: 'progressoes', label: 'Progressões' },
];

function sparkPoints(data: number[]) {
  if (data.length < 2) return '0,15 100,15';
  return data.map((y, i) => `${(i / (data.length - 1)) * 100},${30 - y * 26}`).join(' ');
}

function fmtDelta(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${formatDecimal(n, Math.abs(n) < 10 && !Number.isInteger(n) ? 1 : 0)}`;
}

export function EvolucaoTab() {
  const { data, evoTab, setEvoTab, addMetric, setProgressionIndex } = useAppState();
  const [addOpen, setAddOpen] = useState<'measure' | 'benchmark' | null>(null);

  const weights = weightSeries(data);
  const weightPoints =
    weights.length >= 2
      ? (() => {
          const values = weights.map((w) => w.kg);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = max - min || 1;
          return values.map((v) => (v - min) / range);
        })()
      : [];
  const benchmarks = metricSeriesByName(data, 'benchmark');
  const measures = metricSeriesByName(data, 'measure');

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
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="pf-btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setAddOpen('benchmark')}>
              + PERFORMANCE
            </button>
          </div>
          <div className="pf-metrics-grid">
            {weights.length > 0 && (
              <div className="pf-metric-card">
                <div className="pf-metric-name">Peso</div>
                <div className="pf-metric-value">{formatDecimal(weights[weights.length - 1].kg)} kg</div>
                <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                  <polyline points={sparkPoints(weightPoints)} fill="none" stroke="var(--pf-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="pf-metric-foot">
                  <span className="pf-metric-base">base {formatDecimal(weights[0].kg)}</span>
                  <span className="pf-metric-delta">{fmtDelta(weights[weights.length - 1].kg - weights[0].kg)} kg</span>
                </div>
              </div>
            )}
            {benchmarks.map((m) => (
              <div className="pf-metric-card" key={m.name}>
                <div className="pf-metric-name">{m.name}</div>
                <div className="pf-metric-value">
                  {formatDecimal(m.latest.value, Number.isInteger(m.latest.value) ? 0 : 1)} {m.unit}
                </div>
                <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                  <polyline points={sparkPoints(m.points)} fill="none" stroke="var(--pf-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="pf-metric-foot">
                  <span className="pf-metric-base">
                    base {formatDecimal(m.base.value, Number.isInteger(m.base.value) ? 0 : 1)}
                  </span>
                  <span className="pf-metric-delta">
                    {fmtDelta(m.delta)} {m.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {weights.length === 0 && benchmarks.length === 0 && (
            <div className="pf-empty-state">Nenhum dado ainda. Registre seu peso em Hoje ou toque em "+ Performance".</div>
          )}
        </>
      )}

      {evoTab === 'progressoes' && (
        <div className="pf-progressions-list">
          {data.progressions.map((p) => {
            const def = getProgressionDef(p.id);
            if (!def) return null;
            const atStart = p.currentIndex <= 0;
            const atEnd = p.currentIndex >= def.steps.length - 1;
            return (
              <div className="pf-progression-card" key={p.id}>
                <div className="pf-progression-head">
                  <div className="pf-progression-name">{def.name}</div>
                  <div className="pf-progression-stage">
                    ETAPA {p.currentIndex + 1} / {def.steps.length}
                  </div>
                </div>
                <div className="pf-progression-note">Onde estou → próximo passo → objetivo. Sem pular fases.</div>
                <div className="pf-progression-steps">
                  <StepTimeline steps={def.steps} current={p.currentIndex} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    className="pf-btn-outline"
                    style={{ flex: 1, padding: 9, fontSize: 13 }}
                    disabled={atStart}
                    onClick={() => setProgressionIndex(p.id, p.currentIndex - 1)}
                  >
                    ‹ ETAPA ANTERIOR
                  </button>
                  <button
                    className="pf-btn-primary"
                    style={{ flex: 1, padding: 9, fontSize: 13 }}
                    disabled={atEnd}
                    onClick={() => setProgressionIndex(p.id, p.currentIndex + 1)}
                  >
                    PRÓXIMA ETAPA ›
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {evoTab === 'medidas' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="pf-btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setAddOpen('measure')}>
              + MEDIDA
            </button>
          </div>
          {measures.length === 0 ? (
            <div className="pf-empty-state">Nenhuma medida registrada ainda.</div>
          ) : (
            <div className="pf-measures-list">
              {measures.map((m) => (
                <div className="pf-measure-row" key={m.name}>
                  <div className="pf-measure-name">{m.name}</div>
                  <div className="pf-measure-base">
                    {formatDecimal(m.base.value, Number.isInteger(m.base.value) ? 0 : 1)} {m.unit}
                  </div>
                  <div className="pf-measure-now">
                    {formatDecimal(m.latest.value, Number.isInteger(m.latest.value) ? 0 : 1)} {m.unit}
                  </div>
                  <div className="pf-measure-delta">{fmtDelta(m.delta)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {addOpen && (
        <AddMetricModal
          category={addOpen}
          onClose={() => setAddOpen(null)}
          onSave={(values) => addMetric({ category: addOpen, ...values })}
        />
      )}
    </div>
  );
}
