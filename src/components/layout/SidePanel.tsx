import { BLOCKS, HANDSTAND_CURRENT, HANDSTAND_STEPS, WEEK_DOT_CURRENT_INDEX, WEEK_DOT_LABELS } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { StepTimeline } from '../common/StepTimeline';

export function SidePanel() {
  const { nextBlockId, startSession } = useAppState();
  const nextBlock = nextBlockId ? BLOCKS.find((b) => b.id === nextBlockId) ?? null : null;

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
            <button className="pf-btn-primary" style={{ marginTop: 13, width: '100%', padding: 11, fontSize: 16 }} onClick={() => startSession(nextBlock.id)}>
              INICIAR SESSÃO
            </button>
          </div>
        </>
      )}

      <div className="pf-section-label" style={{ margin: '20px 0 10px' }}>
        PROGRESSÃO — HANDSTAND
      </div>
      <div className="pf-card" style={{ padding: '14px 15px' }}>
        <StepTimeline steps={HANDSTAND_STEPS} current={HANDSTAND_CURRENT} />
      </div>

      <div className="pf-section-label" style={{ margin: '20px 0 10px' }}>
        PROGRESSO DA SEMANA
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {WEEK_DOT_LABELS.map((day, i) => (
          <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: i === WEEK_DOT_CURRENT_INDEX ? 'var(--pf-accent)' : 'transparent',
                border: `1.5px solid ${i === WEEK_DOT_CURRENT_INDEX ? 'var(--pf-accent)' : '#3A3F45'}`,
              }}
            />
            <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 8.5, color: 'var(--pf-text-secondary)' }}>{day}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, fontFamily: 'var(--pf-font-mono)', fontSize: 10, letterSpacing: '.2em', lineHeight: 1.9, color: 'var(--pf-text-secondary)' }}>
        MAIS QUE UM APP.
        <br />
        É O SEU PROCESSO.
      </div>
    </aside>
  );
}
