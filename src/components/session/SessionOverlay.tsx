import { useState } from 'react';
import { getBlock } from '../../data/catalog';
import { useAppState } from '../../state/AppState';
import { PlayGlyph } from '../common/Icons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SetRowProps {
  exIndex: number;
  setIndex: number;
  reps: string;
  load: string;
  durationSec: number | null;
  note: string;
  done: boolean;
}

function SetRow({ exIndex, setIndex, reps, load, durationSec, note, done }: SetRowProps) {
  const { updateSet, toggleSetDone } = useAppState();
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        border: `1px solid ${done ? 'rgba(198,255,0,.3)' : 'var(--pf-border)'}`,
        background: done ? 'rgba(198,255,0,.05)' : 'var(--pf-surface)',
        borderRadius: 11,
        padding: '10px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          aria-label={done ? `Desmarcar série ${setIndex + 1}` : `Concluir série ${setIndex + 1}`}
          onClick={() => toggleSetDone(exIndex, setIndex)}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            flex: 'none',
            cursor: 'pointer',
            border: `1.5px solid ${done ? 'var(--pf-accent)' : '#3A3F45'}`,
            background: done ? 'var(--pf-accent)' : 'transparent',
            color: '#0B0D0F',
            fontSize: 12,
          }}
        >
          {done ? '✓' : ''}
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, flex: 'none' }}>Série {setIndex + 1}</div>
        <input
          aria-label="Repetições"
          className="pf-input"
          style={{ padding: '7px 8px', fontSize: 13, flex: 1, minWidth: 0 }}
          placeholder="reps"
          inputMode="numeric"
          value={reps}
          onChange={(e) => updateSet(exIndex, setIndex, { reps: e.target.value })}
        />
        <input
          aria-label="Carga"
          className="pf-input"
          style={{ padding: '7px 8px', fontSize: 13, flex: 1, minWidth: 0 }}
          placeholder="carga"
          inputMode="decimal"
          value={load}
          onChange={(e) => updateSet(exIndex, setIndex, { load: e.target.value })}
        />
        <button className="pf-icon-btn" onClick={() => setExpanded((e) => !e)} aria-label="Mais campos">
          {expanded ? '▲' : '▾'}
        </button>
      </div>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <input
            aria-label="Tempo em segundos"
            className="pf-input"
            style={{ padding: '8px 10px', fontSize: 13 }}
            placeholder="tempo (s)"
            inputMode="numeric"
            value={durationSec ?? ''}
            onChange={(e) => {
              const n = e.target.value === '' ? null : Number(e.target.value);
              updateSet(exIndex, setIndex, { durationSec: Number.isFinite(n) ? n : null });
            }}
          />
          <textarea
            aria-label="Observações"
            className="pf-textarea"
            style={{ minHeight: 50, padding: '8px 10px', fontSize: 13 }}
            placeholder="observações"
            value={note}
            onChange={(e) => updateSet(exIndex, setIndex, { note: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

export function SessionOverlay() {
  const { data, goToExercise, prevExercise, finishSession, togglePauseSession, saveAndExitSession, abandonSession, sessionHasUnsavedProgress } =
    useAppState();
  const [confirmExit, setConfirmExit] = useState(false);
  const session = data.activeSession;
  if (!session) return null;

  const block = getBlock(session.blockId);
  if (!block) return null;

  const exIdx = Math.min(session.currentExerciseIndex, session.exercises.length - 1);
  const exLog = session.exercises[exIdx];
  const exCatalog = block.ex[exIdx];
  const isLast = exIdx >= session.exercises.length - 1;
  const resting = session.restSecondsLeft > 0;
  const paused = session.paused;

  function handleExit() {
    if (sessionHasUnsavedProgress) {
      setConfirmExit(true);
    } else {
      abandonSession();
    }
  }

  return (
    <div className="pf-session-overlay" role="dialog" aria-modal="true" aria-label={`Sessão de ${block.name}`}>
      <div className="pf-session-header">
        <div className="pf-session-header-row">
          <button className="pf-session-exit" onClick={handleExit}>
            ← SAIR
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="pf-icon-btn" onClick={togglePauseSession} aria-label={paused ? 'Retomar' : 'Pausar'}>
              {paused ? '▶' : '⏸'}
            </button>
            <div className="pf-session-counter">
              EXERCÍCIO {exIdx + 1} / {session.exercises.length}
            </div>
          </div>
        </div>
        <div className="pf-session-name">{block.name}</div>
        <div className="pf-session-progress">
          {session.exercises.map((_, i) => (
            <button
              key={i}
              onClick={() => goToExercise(i)}
              aria-label={`Ir para exercício ${i + 1}`}
              className="pf-session-progress-seg"
              style={{ background: i <= exIdx ? 'var(--pf-accent)' : '#2B3036', border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
        {paused && (
          <div style={{ marginTop: 10, fontFamily: 'var(--pf-font-mono)', fontSize: 10, letterSpacing: '.14em', color: 'var(--pf-accent)' }}>
            SESSÃO PAUSADA
          </div>
        )}
      </div>

      <div className="pf-session-body">
        <div>
          <div className="pf-session-breadcrumb">
            {block.area} → {block.limit} → {exCatalog.name.toUpperCase()}
          </div>

          {exCatalog.videoUrl ? (
            <video
              className="pf-session-media"
              src={exCatalog.videoUrl}
              poster={exCatalog.thumbnail ?? undefined}
              controls
              playsInline
              style={{ width: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="pf-session-media">
              <div className="pf-session-media-stripes" />
              <div className="pf-session-media-center">
                <div className="pf-session-play">
                  <PlayGlyph size={18} />
                </div>
                <div className="pf-session-media-label">VÍDEO DE DEMONSTRAÇÃO</div>
              </div>
              <div className="pf-session-media-tag">EM BREVE</div>
            </div>
          )}

          <div className="pf-session-ex-name">{exCatalog.name}</div>
          <div className="pf-session-ex-objective">{exCatalog.obj}</div>
        </div>

        <div>
          <div className="pf-session-metrics">
            <div className="pf-session-metric">
              <div className="pf-session-metric-label">SÉRIES</div>
              <div className="pf-session-metric-value">{exCatalog.sets}</div>
            </div>
            <div className="pf-session-metric">
              <div className="pf-session-metric-label">EXECUÇÃO</div>
              <div className="pf-session-metric-value">{exCatalog.reps}</div>
            </div>
            <div className="pf-session-metric">
              <div className="pf-session-metric-label">DESCANSO</div>
              <div className="pf-session-metric-value">{exCatalog.rest}</div>
            </div>
          </div>

          <div className="pf-session-cues">
            <div className="pf-session-box-label">COMO EXECUTAR</div>
            {exCatalog.cues.map((c) => (
              <div className="pf-session-item-row" key={c}>
                <div className="pf-session-item-dot" />
                <div className="pf-session-item-text">{c}</div>
              </div>
            ))}
          </div>

          <div className="pf-session-errors">
            <div className="pf-session-box-label">ERROS MAIS COMUNS</div>
            {exCatalog.errs.map((e) => (
              <div className="pf-session-item-row" key={e}>
                <div className="pf-session-item-diamond" />
                <div className="pf-session-item-text">{e}</div>
              </div>
            ))}
          </div>

          <div className="pf-session-sets-label">SÉRIES</div>
          <div className="pf-session-sets">
            {exLog.sets.map((s) => (
              <SetRow
                key={s.index}
                exIndex={exIdx}
                setIndex={s.index}
                reps={s.reps}
                load={s.load}
                durationSec={s.durationSec}
                note={s.note}
                done={s.done}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pf-session-footer">
        {exIdx > 0 && (
          <button className="pf-session-exit" style={{ flex: 'none' }} onClick={prevExercise} aria-label="Exercício anterior">
            ‹
          </button>
        )}
        <div
          className="pf-session-rest"
          style={{
            borderColor: resting ? 'var(--pf-accent)' : 'var(--pf-border)',
            fontFamily: resting ? 'var(--pf-font-display)' : 'var(--pf-font-mono)',
            fontWeight: resting ? 700 : 400,
            fontSize: resting ? 20 : 9.5,
            letterSpacing: resting ? 0 : '.12em',
            color: resting ? 'var(--pf-accent)' : 'var(--pf-text-secondary)',
            animation: resting && !paused ? 'pf-pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {resting ? `${session.restSecondsLeft}s` : 'DESCANSO'}
        </div>
        <button className="pf-session-next" onClick={finishSession}>
          {isLast ? 'CONCLUIR SESSÃO' : 'PRÓXIMO EXERCÍCIO'}
        </button>
      </div>

      {confirmExit && (
        <ConfirmDialog
          title="Sair do treino?"
          message="Você tem progresso registrado nesta sessão. Ela fica salva automaticamente e você pode continuar depois de onde parou — ou, se preferir, encerrar agora e registrar como sessão incompleta no histórico."
          confirmLabel="Encerrar sessão"
          cancelLabel="Continuar treino"
          danger
          extraAction={{
            label: 'Sair e manter salvo',
            onClick: () => {
              setConfirmExit(false);
              saveAndExitSession();
            },
          }}
          onCancel={() => setConfirmExit(false)}
          onConfirm={() => {
            setConfirmExit(false);
            abandonSession();
          }}
        />
      )}
    </div>
  );
}
