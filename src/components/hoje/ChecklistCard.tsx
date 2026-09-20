import { useAppState } from '../../state/AppState';

export function ChecklistCard() {
  const { checklist } = useAppState();
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <>
      <div className="pf-section-head">
        <div className="pf-section-label">CHECKLIST DO DIA</div>
        <div className="pf-section-count">
          {doneCount}/{checklist.length}
        </div>
      </div>
      {checklist.length === 0 ? (
        <div className="pf-empty-state">Dia de descanso — nada para marcar hoje.</div>
      ) : (
        <div className="pf-card" style={{ overflow: 'hidden' }}>
          {checklist.map((item) => (
            <div className="pf-checklist-row" key={item.id} style={{ cursor: 'default' }}>
              <div
                className="pf-checklist-dot"
                style={{
                  border: `1.5px solid ${item.done ? 'var(--pf-accent)' : '#3A3F45'}`,
                  background: item.done ? 'var(--pf-accent)' : 'transparent',
                }}
              />
              <div
                className="pf-checklist-label"
                style={{
                  color: item.done ? 'var(--pf-text-secondary)' : 'var(--pf-text)',
                  textDecoration: item.done ? 'line-through' : 'none',
                }}
              >
                {item.label}
              </div>
              <div className="pf-checklist-value">{item.value}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9.5, color: 'var(--pf-text-faint)', marginTop: 8, lineHeight: 1.5 }}>
        Este checklist é calculado a partir do que você realmente registrou — treino do box, blocos complementares, água, alimentação e peso.
      </div>
    </>
  );
}
