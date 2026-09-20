interface StepTimelineProps {
  steps: string[];
  current: number;
}

export function StepTimeline({ steps, current }: StepTimelineProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {steps.map((label, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        const isLast = i === steps.length - 1;
        const dotSize = isCurrent ? 13 : 9;
        return (
          <div className="pf-step-row" key={label}>
            <div className="pf-step-rail">
              <div
                className="pf-step-dot"
                style={{
                  width: dotSize,
                  height: dotSize,
                  background: isDone || isCurrent ? 'var(--pf-accent)' : 'transparent',
                  border: `1.5px solid ${isDone || isCurrent ? 'var(--pf-accent)' : '#3A3F45'}`,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(198,255,0,.15)' : 'none',
                }}
              />
              {!isLast && (
                <div
                  className="pf-step-line"
                  style={{ minHeight: 16, background: isDone ? 'var(--pf-accent)' : '#2B3036' }}
                />
              )}
            </div>
            <div
              className="pf-step-text"
              style={{
                color: isDone ? 'var(--pf-text-secondary)' : isCurrent ? 'var(--pf-text)' : 'var(--pf-text-dim)',
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {label}
              <span className="pf-step-tag" style={{ color: isCurrent ? 'var(--pf-accent)' : 'var(--pf-text-faint)' }}>
                {isDone ? '  CONCLUÍDO' : isCurrent ? '  VOCÊ ESTÁ AQUI' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
