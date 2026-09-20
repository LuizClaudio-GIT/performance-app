import { useState } from 'react';
import { getBlock } from '../../data/catalog';
import { dayMonthShort, weekDates, weekdayShort } from '../../lib/date';
import { useAppState } from '../../state/AppState';
import { getDayPlan, weekDayStatus, weeklyComplementaryVolume, type WeekDayStatus } from '../../state/logic';
import { DayDetailModal } from './DayDetailModal';

const STATUS_COLOR: Record<WeekDayStatus, string> = {
  CONCLUÍDO: 'var(--pf-accent)',
  HOJE: 'var(--pf-accent)',
  PLANEJADO: 'var(--pf-text-secondary)',
  LEVE: 'var(--pf-text-secondary)',
  DESCANSO: 'var(--pf-text-secondary)',
};

export function SemanaTab() {
  const { data, today } = useAppState();
  const [openDate, setOpenDate] = useState<string | null>(null);
  const week = weekDates(today);
  const volume = weeklyComplementaryVolume(data, week);

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
          <div className="pf-volume-value">{volume.pct}%</div>
        </div>
        <div className="pf-progress-track" style={{ marginTop: 10 }}>
          <div className="pf-progress-fill" style={{ width: `${volume.pct}%` }} />
        </div>
        <div className="pf-volume-foot">
          <span>
            {volume.done} DE {volume.planned} SESSÕES
          </span>
          <span>META SEMANAL</span>
        </div>
      </div>

      <div className="pf-week-list">
        {week.map((date) => {
          const plan = getDayPlan(data, date);
          const status = weekDayStatus(data, date);
          const isToday = status === 'HOJE';
          const blocks = plan.complementaryBlockIds.map((id) => getBlock(id)).filter((b): b is NonNullable<typeof b> => !!b);
          return (
            <button
              className="pf-week-row"
              key={date}
              onClick={() => setOpenDate(date)}
              style={{
                border: `1px solid ${isToday ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
                background: plan.type === 'descanso' ? 'var(--pf-surface-muted)' : 'var(--pf-surface)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                className="pf-week-day"
                style={{
                  background: isToday ? 'var(--pf-accent-soft)' : 'transparent',
                  color: isToday ? 'var(--pf-accent)' : 'var(--pf-text)',
                }}
              >
                <div className="pf-week-day-num">{weekdayShort(date)}</div>
                <div className="pf-week-day-date">{dayMonthShort(date)}</div>
              </div>
              <div className="pf-week-body">
                <div className="pf-week-box">BOX · {plan.type === 'treino' ? plan.boxLabel : '—'}</div>
                <div className="pf-week-work">
                  {blocks.length === 0 && plan.type !== 'treino' && (
                    <span className="pf-week-work-tag" style={{ border: '1px solid var(--pf-border)', color: 'var(--pf-text-secondary)' }}>
                      {plan.note || (plan.type === 'descanso' ? 'Recuperação' : 'Leve')}
                    </span>
                  )}
                  {blocks.map((b) => {
                    const done = data.sessions.some((s) => s.blockId === b.id && s.date === date && s.status === 'completed');
                    return (
                      <span
                        className="pf-week-work-tag"
                        key={b.id}
                        style={{
                          border: `1px solid ${isToday && !done ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
                          background: done ? 'rgba(198,255,0,.10)' : isToday ? 'rgba(198,255,0,.14)' : 'transparent',
                          color: done || isToday ? 'var(--pf-accent)' : 'var(--pf-text)',
                        }}
                      >
                        {b.name}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="pf-week-state" style={{ color: STATUS_COLOR[status] }}>
                {status}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pf-quote-banner">
        PEQUENAS AÇÕES,
        <br />
        GRANDES RESULTADOS.
      </div>

      {openDate && <DayDetailModal date={openDate} onClose={() => setOpenDate(null)} />}
    </div>
  );
}
