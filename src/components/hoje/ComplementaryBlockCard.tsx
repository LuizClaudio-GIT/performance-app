import type { ComplementaryBlock } from '../../types';
import { useAppState } from '../../state/AppState';

export function ComplementaryBlockCard({ block }: { block: ComplementaryBlock }) {
  const { blockDone, startSession, nextBlockId } = useAppState();
  const done = blockDone[block.id];
  const hero = !done && nextBlockId === block.id;

  return (
    <div
      className="pf-block-card"
      style={{
        border: `1px solid ${done ? 'var(--pf-border-soft)' : hero ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
        background: done ? 'var(--pf-surface-muted)' : 'var(--pf-surface)',
        opacity: done ? 0.6 : 1,
      }}
    >
      <div className="pf-block-top">
        <div
          className="pf-block-icon"
          style={{
            border: `1px solid ${hero ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
            color: hero ? 'var(--pf-accent)' : 'var(--pf-text)',
            background: hero ? 'var(--pf-accent-soft)' : 'transparent',
          }}
        >
          <div className="pf-block-icon-glyph">{block.glyph}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pf-block-name-row">
            <div className="pf-block-name">{block.name}</div>
            <span
              className="pf-block-prio"
              style={{
                color: block.prio === 'PRIORIDADE ALTA' ? 'var(--pf-accent)' : 'var(--pf-text-secondary)',
                border: `1px solid ${block.prio === 'PRIORIDADE ALTA' ? 'var(--pf-accent-border)' : 'var(--pf-border)'}`,
              }}
            >
              {block.prio}
            </span>
          </div>
          <div className="pf-block-meta">{block.meta}</div>
          <div className="pf-block-obj">{block.obj}</div>
        </div>
      </div>
      <div className="pf-block-bottom">
        <div className="pf-block-tags">
          {block.tags.map((t) => (
            <span className="pf-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <button
          className={`pf-block-btn ${done ? 'pf-btn-done' : hero ? 'pf-btn-primary' : 'pf-btn-outline'}`}
          disabled={done}
          onClick={() => !done && startSession(block.id)}
        >
          {done ? 'CONCLUÍDO' : 'INICIAR'}
        </button>
      </div>
    </div>
  );
}
