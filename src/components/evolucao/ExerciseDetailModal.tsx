import { Modal } from '../common/Modal';
import { useAppState } from '../../state/AppState';
import { dayMonthShort } from '../../lib/date';
import {
  bestPoint,
  exerciseBestLoadSeries,
  exerciseDurationSeries,
  exerciseHistory,
  exerciseTotalRepsSeries,
  exerciseVolumeSeries,
} from '../../state/logic';

function Stat({ label, point, unit }: { label: string; point: { date: string; value: number } | null; unit: string }) {
  if (!point) return null;
  return (
    <div className="pf-metric-card">
      <div className="pf-metric-name">{label}</div>
      <div className="pf-metric-value">
        {Number.isInteger(point.value) ? point.value : point.value.toFixed(1)} {unit}
      </div>
      <div className="pf-metric-foot">
        <span className="pf-metric-base">recorde</span>
        <span className="pf-metric-delta">{dayMonthShort(point.date)}</span>
      </div>
    </div>
  );
}

export function ExerciseDetailModal({ exerciseName, onClose }: { exerciseName: string; onClose: () => void }) {
  const { data } = useAppState();
  const history = exerciseHistory(data, exerciseName);
  const loadSeries = exerciseBestLoadSeries(data, exerciseName);
  const repsSeries = exerciseTotalRepsSeries(data, exerciseName);
  const volumeSeries = exerciseVolumeSeries(data, exerciseName);
  const durationSeries = exerciseDurationSeries(data, exerciseName);

  const bestLoad = bestPoint(loadSeries);
  const bestReps = bestPoint(repsSeries);
  const bestVolume = bestPoint(volumeSeries);
  const bestDuration = bestPoint(durationSeries);

  const hasAnyNumericData = bestLoad || bestReps || bestVolume || bestDuration;

  return (
    <Modal title={exerciseName} onClose={onClose}>
      {hasAnyNumericData ? (
        <div className="pf-metrics-grid">
          <Stat label="Melhor carga" point={bestLoad} unit="kg" />
          <Stat label="Mais reps (sessão)" point={bestReps} unit="reps" />
          <Stat label="Maior volume" point={bestVolume} unit="kg·reps" />
          <Stat label="Maior tempo" point={bestDuration} unit="s" />
        </div>
      ) : (
        <div className="pf-empty-state">
          Sem carga/reps/tempo numéricos suficientes nas séries registradas para calcular recordes — os valores continuam no histórico abaixo.
        </div>
      )}

      <div className="pf-section-label" style={{ margin: '14px 2px 6px' }}>
        HISTÓRICO ({history.length})
      </div>
      <div className="pf-card" style={{ padding: '4px 14px', maxHeight: '40vh', overflowY: 'auto' }}>
        {history
          .slice()
          .reverse()
          .map((entry) => (
            <div className="pf-attempt-row" key={`${entry.sessionId}-${entry.date}`} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 8.5, color: 'var(--pf-text-faint)' }}>{dayMonthShort(entry.date)}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {entry.sets.map((s, i) => (
                  <span key={i} className="pf-tag">
                    {s.reps || '—'}{s.load ? ` · ${s.load}` : ''}{s.durationSec ? ` · ${s.durationSec}s` : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="pf-modal-actions">
        <button className="pf-btn-primary" style={{ flex: 1 }} onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}
