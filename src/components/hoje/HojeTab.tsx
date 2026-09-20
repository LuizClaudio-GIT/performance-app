import { useState } from 'react';
import { getBlock } from '../../data/catalog';
import { dayMonthLongUpper, formatDecimal, formatInt, weekdayLongUpper } from '../../lib/date';
import { useAppState, useTodayPlan, useTodayWater } from '../../state/AppState';
import { useToast } from '../common/Toast';
import { LogStatModal } from '../common/LogStatModal';
import { DumbbellIcon } from '../common/Icons';
import { ChecklistCard } from './ChecklistCard';
import { ComplementaryBlockCard } from './ComplementaryBlockCard';

type StatModalKind = 'peso' | 'passos' | 'agua' | null;

export function HojeTab() {
  const { data, today, toggleBoxWorkoutDone, logWeight, setSteps, addWater } = useAppState();
  const { showToast } = useToast();
  const plan = useTodayPlan();
  const water = useTodayWater();
  const [openModal, setOpenModal] = useState<StatModalKind>(null);

  const latestWeight = [...data.weightLog].filter((w) => w.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0];
  const steps = data.steps[today] ?? 0;

  const blocks = plan.complementaryBlockIds.map((id) => getBlock(id)).filter((b): b is NonNullable<typeof b> => !!b);
  const blocksDone = blocks.filter((b) =>
    data.sessions.some((s) => s.blockId === b.id && s.date === today && s.status === 'completed'),
  ).length;

  const focusTitle = blocks.length > 0 ? blocks.map((b) => b.name).join(' + ') : 'DIA DE DESCANSO';
  const focusTags = Array.from(new Set(blocks.flatMap((b) => b.tags))).slice(0, 3);
  const focusObjective =
    blocks.length > 0
      ? blocks.map((b) => b.obj).join(' ')
      : plan.note || 'Aproveite para recuperar — mobilidade leve e sono são treino também.';

  const boxDone = !!data.boxWorkoutDone[today];

  return (
    <div className="pf-page">
      <div className="pf-hero">
        <div className="pf-hero-stripes" />
        <div className="pf-hero-fade" />
        <div className="pf-hero-tag">FOTO P&amp;B — ATLETA</div>
        <div className="pf-hero-body">
          <div className="pf-hero-date">
            {weekdayLongUpper(today)}
            <br />
            {dayMonthLongUpper(today)}
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
        <div className="pf-focus-title">{focusTitle}</div>
        {focusTags.length > 0 && (
          <div className="pf-focus-tags">
            {focusTags.map((t) => (
              <span className="pf-tag pf-tag--accent" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="pf-focus-objective">
          <strong>Objetivo: </strong>
          {focusObjective}
        </div>
      </div>

      {plan.type === 'treino' && (
        <>
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
                <div className="pf-box-name">{plan.boxLabel || 'CROSSFIT'}</div>
                <div className="pf-box-meta">{data.profile.box}</div>
              </div>
              <button
                className="pf-badge"
                style={{
                  cursor: 'pointer',
                  border: `1px solid ${boxDone ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
                  color: boxDone ? 'var(--pf-accent)' : 'var(--pf-text-secondary)',
                  background: boxDone ? 'var(--pf-accent-soft)' : 'transparent',
                }}
                onClick={() => {
                  toggleBoxWorkoutDone();
                  showToast(boxDone ? 'Treino do box desmarcado.' : 'Treino do box registrado!');
                }}
              >
                {boxDone ? '✓ CONCLUÍDO' : 'MARCAR CONCLUÍDO'}
              </button>
            </div>
            {plan.boxWorkoutBody && (
              <div className="pf-wod">
                <div className="pf-wod-body">
                  <div className="pf-wod-label">{plan.boxWorkoutTitle || 'WOD DO DIA'}</div>
                  <div className="pf-wod-text" style={{ whiteSpace: 'pre-line' }}>
                    {plan.boxWorkoutBody}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="pf-section-head">
        <div className="pf-section-label pf-section-label--accent">DESENVOLVIMENTO COMPLEMENTAR</div>
        <div className="pf-section-count">
          {blocksDone}/{blocks.length || 0}
        </div>
      </div>
      {blocks.length === 0 ? (
        <div className="pf-empty-state">Nenhum bloco complementar planejado para hoje.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {blocks.map((b) => (
            <ComplementaryBlockCard key={b.id} block={b} />
          ))}
        </div>
      )}

      <ChecklistCard />

      <div className="pf-stats-grid">
        <button className="pf-stat-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpenModal('peso')}>
          <div className="pf-stat-label">PESO</div>
          <div className="pf-stat-value">{latestWeight ? formatDecimal(latestWeight.kg) : '—'}</div>
          <div className="pf-stat-sub">{latestWeight?.date === today ? 'registrado hoje' : 'toque para registrar'}</div>
        </button>
        <button className="pf-stat-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpenModal('passos')}>
          <div className="pf-stat-label">PASSOS</div>
          <div className="pf-stat-value">{formatInt(steps)}</div>
          <div className="pf-progress-track pf-progress-track--thin" style={{ marginTop: 9 }}>
            <div className="pf-progress-fill" style={{ width: `${Math.min(100, (steps / data.goals.stepsGoal) * 100)}%` }} />
          </div>
          <div className="pf-stat-sub">meta {formatInt(data.goals.stepsGoal)}</div>
        </button>
        <button className="pf-stat-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpenModal('agua')}>
          <div className="pf-stat-label">ÁGUA</div>
          <div className="pf-stat-value">{formatDecimal(water)} L</div>
          <div className="pf-progress-track pf-progress-track--thin" style={{ marginTop: 9 }}>
            <div className="pf-progress-fill" style={{ width: `${Math.min(100, (water / data.goals.waterGoalL) * 100)}%` }} />
          </div>
          <div className="pf-stat-sub">meta {formatDecimal(data.goals.waterGoalL)} L</div>
        </button>
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

      {openModal === 'peso' && (
        <LogStatModal
          title="Registrar peso"
          label="Peso"
          unit="kg"
          initialValue={latestWeight?.date === today ? latestWeight.kg : latestWeight?.kg ?? 0}
          onSave={(v) => {
            logWeight(v);
            showToast('Peso registrado!');
          }}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'passos' && (
        <LogStatModal
          title="Registrar passos"
          label="Passos"
          unit="passos"
          initialValue={steps}
          onSave={(v) => {
            setSteps(Math.round(v));
            showToast('Passos atualizados!');
          }}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'agua' && (
        <LogStatModal
          title="Registrar água"
          label="Total de hoje"
          unit="L"
          initialValue={water}
          onSave={(v) => {
            addWater(v - water);
            showToast('Água registrada!');
          }}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
