import { CHECKLIST } from '../../data/mockData';
import { useAppState } from '../../state/AppState';

export function ChecklistCard() {
  const { checks, toggleCheck, checkDoneCount } = useAppState();

  return (
    <>
      <div className="pf-section-head">
        <div className="pf-section-label">CHECKLIST DO DIA</div>
        <div className="pf-section-count">{checkDoneCount}/6</div>
      </div>
      <div className="pf-card" style={{ overflow: 'hidden' }}>
        {CHECKLIST.map((item) => {
          const on = checks[item.id];
          return (
            <button className="pf-checklist-row" key={item.id} onClick={() => toggleCheck(item.id)}>
              <div
                className="pf-checklist-dot"
                style={{
                  border: `1.5px solid ${on ? 'var(--pf-accent)' : '#3A3F45'}`,
                  background: on ? 'var(--pf-accent)' : 'transparent',
                }}
              />
              <div
                className="pf-checklist-label"
                style={{
                  color: on ? 'var(--pf-text-secondary)' : 'var(--pf-text)',
                  textDecoration: on ? 'line-through' : 'none',
                }}
              >
                {item.label}
              </div>
              <div className="pf-checklist-value">{item.value}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
