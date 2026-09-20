import { useState } from 'react';
import { formatDecimal } from '../../lib/date';
import type { EvoTabId } from '../../types';
import { useAppState } from '../../state/AppState';
import { exerciseNamesInHistory, findProgressionDef, metricSeriesByName, weightSeries } from '../../state/logic';
import { bestWorkoutAttempt, formatWodResultShort } from '../../state/workouts';
import { StepTimeline } from '../common/StepTimeline';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { AddMetricModal } from './AddMetricModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { BenchmarkDetailModal } from './BenchmarkDetailModal';
import { WorkoutDefModal } from './WorkoutDefModal';
import { ProgressionDefModal } from './ProgressionDefModal';
import { ProgressionNoteModal } from './ProgressionNoteModal';

const EVO_TABS: { id: EvoTabId; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'treinos', label: 'Treinos' },
  { id: 'benchmarks', label: 'Benchmarks' },
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
  const { data, evoTab, setEvoTab, addMetric, addWorkoutDef, addProgressionDef, advanceProgression, regressProgression, deleteProgressionDef } =
    useAppState();
  const { showToast } = useToast();
  const [addOpen, setAddOpen] = useState<'measure' | 'benchmark' | null>(null);
  const [exerciseOpen, setExerciseOpen] = useState<string | null>(null);
  const [benchmarkOpen, setBenchmarkOpen] = useState<string | null>(null);
  const [newWorkoutOpen, setNewWorkoutOpen] = useState(false);
  const [newProgressionOpen, setNewProgressionOpen] = useState(false);
  const [progressionAction, setProgressionAction] = useState<{ id: string; direction: 'advance' | 'regress' } | null>(null);
  const [deletingProgression, setDeletingProgression] = useState<string | null>(null);

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
  const exerciseNames = exerciseNamesInHistory(data);

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

      <div className="pf-segmented" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
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
            {benchmarks.map((m) => {
              const latestIsPR = m.latest.id === m.best.id;
              return (
                <div className="pf-metric-card" key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="pf-metric-name">{m.name}</div>
                    {latestIsPR && m.history.length > 1 && <span className="pf-pr-badge">PR</span>}
                  </div>
                  <div className="pf-metric-value">
                    {formatDecimal(m.latest.value, Number.isInteger(m.latest.value) ? 0 : 1)} {m.unit}
                  </div>
                  <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: 8 }}>
                    <polyline points={sparkPoints(m.points)} fill="none" stroke="var(--pf-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="pf-metric-foot">
                    <span className="pf-metric-base">
                      recorde {formatDecimal(m.best.value, Number.isInteger(m.best.value) ? 0 : 1)} {m.unit}
                    </span>
                    <span className="pf-metric-delta">
                      {fmtDelta(m.delta)} {m.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {weights.length === 0 && benchmarks.length === 0 && (
            <div className="pf-empty-state">Nenhum dado ainda. Registre seu peso em Hoje ou toque em "+ Performance".</div>
          )}
        </>
      )}

      {evoTab === 'treinos' && (
        <>
          {exerciseNames.length === 0 ? (
            <div className="pf-empty-state">
              Nenhum exercício com sessão concluída ainda. Complete uma sessão complementar (Hoje) para começar a ver evolução por exercício aqui.
            </div>
          ) : (
            <div className="pf-exercise-list">
              {exerciseNames.map((name) => (
                <button key={name} className="pf-exercise-row" onClick={() => setExerciseOpen(name)}>
                  <div>
                    <div className="pf-exercise-name">{name}</div>
                    <div className="pf-exercise-hint">toque para ver histórico e recordes</div>
                  </div>
                  <span className="pf-shortcut-chevron">›</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {evoTab === 'benchmarks' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="pf-btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setNewWorkoutOpen(true)}>
              + NOVO WOD
            </button>
          </div>
          {data.workoutDefs.length === 0 && <div className="pf-empty-state">Nenhum WOD cadastrado. Toque em "+ Novo WOD" para criar um.</div>}
          <div className="pf-workout-def-list">
            {data.workoutDefs.map((def) => {
              const attempts = data.workoutAttempts.filter((a) => a.workoutDefId === def.id);
              const best = bestWorkoutAttempt(attempts);
              return (
                <button key={def.id} className="pf-workout-def-card" onClick={() => setBenchmarkOpen(def.id)}>
                  <div className="pf-workout-def-name">{def.name}</div>
                  <div className="pf-workout-def-meta">
                    {def.scheme || '—'} {best ? `· melhor: ${formatWodResultShort(best.result)}` : '· sem tentativas'}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {evoTab === 'progressoes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button className="pf-btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setNewProgressionOpen(true)}>
              + NOVA PROGRESSÃO
            </button>
          </div>
          {data.progressions.length === 0 && <div className="pf-empty-state">Nenhuma progressão cadastrada. Toque em "+ Nova progressão" para começar.</div>}
          <div className="pf-progressions-list">
            {data.progressions.map((p) => {
              const def = findProgressionDef(data, p.id);
              if (!def) return null;
              const atStart = p.currentIndex <= 0;
              const atEnd = p.currentIndex >= def.steps.length - 1;
              const lastEvent = p.history[p.history.length - 1];
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
                  {lastEvent && (
                    <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9, color: 'var(--pf-text-faint)', marginTop: 6 }}>
                      última mudança: {lastEvent.date} ({lastEvent.direction === 'advance' ? 'avanço' : 'regressão'})
                      {lastEvent.note ? ` — ${lastEvent.note}` : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      className="pf-btn-outline"
                      style={{ flex: 1, padding: 9, fontSize: 13 }}
                      disabled={atStart}
                      onClick={() => setProgressionAction({ id: p.id, direction: 'regress' })}
                    >
                      ‹ ETAPA ANTERIOR
                    </button>
                    <button
                      className="pf-btn-primary"
                      style={{ flex: 1, padding: 9, fontSize: 13 }}
                      disabled={atEnd}
                      onClick={() => setProgressionAction({ id: p.id, direction: 'advance' })}
                    >
                      PRÓXIMA ETAPA ›
                    </button>
                  </div>
                  {def.source === 'user' && (
                    <button className="pf-icon-btn" style={{ width: 'auto', padding: '0 8px', marginTop: 8 }} onClick={() => setDeletingProgression(p.id)}>
                      🗑 excluir progressão
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
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
          onSave={(values) => {
            const isPR = addMetric({ category: addOpen, ...values });
            showToast(isPR && addOpen === 'benchmark' ? 'Registrado — novo PR! 🏆' : 'Registrado!');
          }}
        />
      )}

      {exerciseOpen && <ExerciseDetailModal exerciseName={exerciseOpen} onClose={() => setExerciseOpen(null)} />}
      {benchmarkOpen && <BenchmarkDetailModal workoutDefId={benchmarkOpen} onClose={() => setBenchmarkOpen(null)} />}

      {newWorkoutOpen && (
        <WorkoutDefModal
          onSave={(values) => {
            addWorkoutDef(values);
            showToast('WOD criado!');
          }}
          onClose={() => setNewWorkoutOpen(false)}
        />
      )}

      {newProgressionOpen && (
        <ProgressionDefModal
          onSave={(values) => {
            addProgressionDef(values);
            showToast('Progressão criada!');
          }}
          onClose={() => setNewProgressionOpen(false)}
        />
      )}

      {progressionAction && (
        <ProgressionNoteModal
          title={progressionAction.direction === 'advance' ? 'Avançar etapa' : 'Voltar etapa'}
          confirmLabel={progressionAction.direction === 'advance' ? 'Avançar' : 'Voltar'}
          onClose={() => setProgressionAction(null)}
          onConfirm={(note) => {
            if (progressionAction.direction === 'advance') advanceProgression(progressionAction.id, note);
            else regressProgression(progressionAction.id, note);
            showToast(progressionAction.direction === 'advance' ? 'Etapa avançada!' : 'Etapa anterior registrada.');
          }}
        />
      )}

      {deletingProgression && (
        <ConfirmDialog
          title="Excluir progressão?"
          message="A progressão e seu histórico de avanço serão removidos."
          confirmLabel="Excluir"
          danger
          onCancel={() => setDeletingProgression(null)}
          onConfirm={() => {
            deleteProgressionDef(deletingProgression);
            showToast('Progressão excluída.');
            setDeletingProgression(null);
          }}
        />
      )}
    </div>
  );
}
