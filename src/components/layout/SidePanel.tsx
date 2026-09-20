import { getBlock } from '../../data/catalog';
import { weekDates, weekdayShort } from '../../lib/date';
import { useAppState } from '../../state/AppState';
import { StepTimeline } from '../common/StepTimeline';
import { findProgressionDef, nextIncompleteBlockId, weekDayStatus } from '../../state/logic';

export function SidePanel() {
  const { data, today, startSession } = useAppState();
  const plan = data.dayPlans[today];
  const nextBlockId = plan ? nextIncompleteBlockId(data, today, plan.complementaryBlockIds) : null;
  const nextBlock = nextBlockId ? getBlock(nextBlockId) : null;

  const progression = data.progressions[0];
  const progressionDef = progression ? findProgressionDef(data, progression.id) : null;

  const week = weekDates(today);

  return (
    <aside className="pf-side-panel">
      {nextBlock && (
        <>
          <div className="pf-section-label" style={{ marginBottom: 10 }}>
            PRÓXIMO PASSO
          </div>
          <div
            className="pf-card"
            style={{
              borderColor: 'var(--pf-accent)',
              background: 'linear-gradient(160deg, rgba(198,255,0,.10), rgba(198,255,0,0) 70%), var(--pf-surface)',
              padding: 15,
            }}
          >
            <div style={{ fontFamily: 'var(--pf-font-display)', fontWeight: 700, fontSize: 26, lineHeight: 1 }}>
              {nextBlock.name}
            </div>
            <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9.5, color: 'var(--pf-text-secondary)', marginTop: 6 }}>
              {nextBlock.meta}
            </div>
            <button
              className="pf-btn-primary"
              style={{ marginTop: 13, width: '100%', padding: 11, fontSize: 16 }}
              onClick={() => startSession(nextBlock.id)}
            >
              INICIAR SESSÃO
            </button>
          </div>
        </>
      )}

      {progression && progressionDef && (
        <>
          <div className="pf-section-label" style={{ margin: '20px 0 10px' }}>
            PROGRESSÃO — {progressionDef.name}
          </div>
          <div className="pf-card" style={{ padding: '14px 15px' }}>
            <StepTimeline steps={progressionDef.steps} current={progression.currentIndex} />
          </div>
        </>
      )}

      <div className="pf-section-label" style={{ margin: '20px 0 10px' }}>
        PROGRESSO DA SEMANA
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {week.map((date) => {
          const status = weekDayStatus(data, date);
          const active = status === 'CONCLUÍDO' || status === 'HOJE';
          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: active ? 'var(--pf-accent)' : 'transparent',
                  border: `1.5px solid ${active ? 'var(--pf-accent)' : '#3A3F45'}`,
                }}
              />
              <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 8.5, color: 'var(--pf-text-secondary)' }}>
                {weekdayShort(date)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, fontFamily: 'var(--pf-font-mono)', fontSize: 10, letterSpacing: '.2em', lineHeight: 1.9, color: 'var(--pf-text-secondary)' }}>
        MAIS QUE UM APP.
        <br />
        É O SEU PROCESSO.
      </div>
    </aside>
  );
}
