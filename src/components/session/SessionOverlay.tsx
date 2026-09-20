import { BLOCKS } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { PlayGlyph } from '../common/Icons';

export function SessionOverlay() {
  const { sessionBlockId, exIdx, setsDone, rest, exitSession, toggleSet, nextExercise } = useAppState();
  const block = sessionBlockId ? BLOCKS.find((b) => b.id === sessionBlockId) ?? null : null;
  if (!block) return null;

  const ex = block.ex[Math.min(exIdx, block.ex.length - 1)];
  const key = `${block.id}-${exIdx}`;
  const done = setsDone[key] || 0;
  const total = parseInt(ex.sets, 10);
  const isLast = exIdx >= block.ex.length - 1;
  const resting = rest > 0;

  return (
    <div className="pf-session-overlay" role="dialog" aria-modal="true" aria-label={`Sessão de ${block.name}`}>
      <div className="pf-session-header">
        <div className="pf-session-header-row">
          <button className="pf-session-exit" onClick={exitSession}>
            ← SAIR
          </button>
          <div className="pf-session-counter">
            EXERCÍCIO {exIdx + 1} / {block.ex.length}
          </div>
        </div>
        <div className="pf-session-name">{block.name}</div>
        <div className="pf-session-progress">
          {block.ex.map((e, i) => (
            <div
              key={e.name}
              className="pf-session-progress-seg"
              style={{ background: i <= exIdx ? 'var(--pf-accent)' : '#2B3036' }}
            />
          ))}
        </div>
      </div>

      <div className="pf-session-body">
        <div>
          <div className="pf-session-breadcrumb">
            {block.area} → {block.limit} → {ex.name.toUpperCase()}
          </div>

          <div className="pf-session-media">
            <div className="pf-session-media-stripes" />
            <div className="pf-session-media-center">
              <div className="pf-session-play">
                <PlayGlyph size={18} />
              </div>
              <div className="pf-session-media-label">VÍDEO DE DEMONSTRAÇÃO</div>
            </div>
            <div className="pf-session-media-tag">EXECUÇÃO LENTA · 12s</div>
          </div>

          <div className="pf-session-ex-name">{ex.name}</div>
          <div className="pf-session-ex-objective">{ex.obj}</div>
        </div>

        <div>
          <div className="pf-session-metrics">
            <div className="pf-session-metric">
              <div className="pf-session-metric-label">SÉRIES</div>
              <div className="pf-session-metric-value">{ex.sets}</div>
            </div>
            <div className="pf-session-metric">
              <div className="pf-session-metric-label">EXECUÇÃO</div>
              <div className="pf-session-metric-value">{ex.reps}</div>
            </div>
            <div className="pf-session-metric">
              <div className="pf-session-metric-label">DESCANSO</div>
              <div className="pf-session-metric-value">{ex.rest}</div>
            </div>
          </div>

          <div className="pf-session-cues">
            <div className="pf-session-box-label">COMO EXECUTAR</div>
            {ex.cues.map((c) => (
              <div className="pf-session-item-row" key={c}>
                <div className="pf-session-item-dot" />
                <div className="pf-session-item-text">{c}</div>
              </div>
            ))}
          </div>

          <div className="pf-session-errors">
            <div className="pf-session-box-label">ERROS MAIS COMUNS</div>
            {ex.errs.map((e) => (
              <div className="pf-session-item-row" key={e}>
                <div className="pf-session-item-diamond" />
                <div className="pf-session-item-text">{e}</div>
              </div>
            ))}
          </div>

          <div className="pf-session-sets-label">SÉRIES</div>
          <div className="pf-session-sets">
            {Array.from({ length: total }, (_, i) => {
              const on = i < done;
              return (
                <button
                  key={i}
                  className="pf-session-set-row"
                  style={{
                    border: `1px solid ${on ? 'rgba(198,255,0,.3)' : 'var(--pf-border)'}`,
                    background: on ? 'rgba(198,255,0,.05)' : 'var(--pf-surface)',
                  }}
                  onClick={() => toggleSet(i)}
                >
                  <div
                    className="pf-session-set-dot"
                    style={{
                      border: `1.5px solid ${on ? 'var(--pf-accent)' : '#3A3F45'}`,
                      background: on ? 'var(--pf-accent)' : 'transparent',
                    }}
                  />
                  <div className="pf-session-set-label">Série {i + 1}</div>
                  <div className="pf-session-set-detail">
                    {ex.reps} · descanso {ex.rest}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pf-session-footer">
        <div
          className="pf-session-rest"
          style={{
            borderColor: resting ? 'var(--pf-accent)' : 'var(--pf-border)',
            fontFamily: resting ? 'var(--pf-font-display)' : 'var(--pf-font-mono)',
            fontWeight: resting ? 700 : 400,
            fontSize: resting ? 20 : 9.5,
            letterSpacing: resting ? 0 : '.12em',
            color: resting ? 'var(--pf-accent)' : 'var(--pf-text-secondary)',
            animation: resting ? 'pf-pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {resting ? `${rest}s` : 'DESCANSO'}
        </div>
        <button className="pf-session-next" onClick={nextExercise}>
          {isLast ? 'CONCLUIR SESSÃO' : 'PRÓXIMO EXERCÍCIO'}
        </button>
      </div>
    </div>
  );
}
