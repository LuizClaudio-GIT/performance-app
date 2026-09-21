import { useMemo, useState } from 'react';
import { Modal } from '../common/Modal';
import { WOD_FORMAT_LABEL } from '../../data/schema';
import type { ResultScale, WodFormat, WodPlan, WodResult, WorkoutAttemptKind } from '../../data/schema';
import { useAppState } from '../../state/AppState';
import { attemptsForLabel, attemptsForWorkoutDef, formatWodResultShort } from '../../state/workouts';
import { dayMonthShort } from '../../lib/date';

const FORMATS: WodFormat[] = ['for-time', 'rounds-reps', 'amrap', 'emom', 'chipper', 'other'];
const TIME_BASED: WodFormat[] = ['for-time', 'rounds-reps', 'chipper'];
const SCALES: ResultScale[] = ['rx', 'scaled', 'other'];
const SCALE_LABEL: Record<ResultScale, string> = { rx: 'RX', scaled: 'SCALED', other: 'OUTRO' };

interface WodResultModalProps {
  title: string;
  kind: WorkoutAttemptKind;
  workoutDefId: string | null;
  initialLabel: string;
  initialPlan: WodPlan;
  onSave: (input: { kind: WorkoutAttemptKind; workoutDefId: string | null; label: string; plan: WodPlan; result: WodResult }) => void;
  onClose: () => void;
}

export function WodResultModal({ title, kind, workoutDefId, initialLabel, initialPlan, onSave, onClose }: WodResultModalProps) {
  const { data } = useAppState();
  const [label, setLabel] = useState(initialLabel);

  // Reactive "last time" lookup — as soon as the label matches a previously
  // logged WOD (by name, or by the linked benchmark def), show it. This is
  // what makes "da última vez fiz 6:42" work for any named/recurring WOD,
  // not just catalog benchmarks.
  const lastAttempt = useMemo(() => {
    const byDef = workoutDefId ? attemptsForWorkoutDef(data, workoutDefId) : [];
    if (byDef.length > 0) return byDef[0];
    return attemptsForLabel(data, label)[0] ?? null;
  }, [data, workoutDefId, label]);
  const [format, setFormat] = useState<WodFormat>(initialPlan.format);
  const [scheme, setScheme] = useState(initialPlan.scheme);
  const [notFinished, setNotFinished] = useState(false);
  const [min, setMin] = useState('');
  const [sec, setSec] = useState('');
  const [rounds, setRounds] = useState('');
  const [extraReps, setExtraReps] = useState('');
  const [totalReps, setTotalReps] = useState('');
  const [scale, setScale] = useState<ResultScale>('rx');
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loadKg, setLoadKg] = useState('');
  const [calories, setCalories] = useState('');

  const isTimeBased = TIME_BASED.includes(format);
  const showTime = isTimeBased && !notFinished;
  const showRounds = (format === 'amrap' || format === 'emom') || (isTimeBased && notFinished);

  function num(v: string): number | null {
    const n = Number(v.replace(',', '.'));
    return v.trim() !== '' && Number.isFinite(n) ? n : null;
  }

  function handleSave() {
    const timeSec = showTime && (min || sec) ? Math.max(0, (num(min) ?? 0) * 60 + (num(sec) ?? 0)) : null;
    const result: WodResult = {
      format,
      timeSec,
      rounds: showRounds ? num(rounds) : null,
      extraReps: showRounds ? num(extraReps) : null,
      totalReps: format === 'other' ? num(totalReps) : null,
      loadKg: num(loadKg),
      calories: num(calories),
      scale,
      rpe,
      notes: notes.trim(),
    };
    const plan: WodPlan = { format, timeCapSec: initialPlan.timeCapSec, scheme, movements: initialPlan.movements };
    onSave({ kind, workoutDefId, label: label.trim() || 'WOD do dia', plan, result });
    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      {lastAttempt && (
        <div className="pf-last-attempt">
          <span className="pf-last-attempt-label">ÚLTIMA VEZ · {dayMonthShort(lastAttempt.date)}</span>
          <span className="pf-last-attempt-value">{formatWodResultShort(lastAttempt.result)}</span>
        </div>
      )}

      <div className="pf-field">
        <label className="pf-field-label" htmlFor="wod-label">
          NOME DO WOD
        </label>
        <input id="wod-label" className="pf-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex.: WOD do dia, Fran…" autoFocus />
      </div>

      <div className="pf-field">
        <label className="pf-field-label">FORMATO</label>
        <div className="pf-segmented" style={{ flexWrap: 'wrap' }}>
          {FORMATS.map((f) => (
            <button key={f} type="button" className="pf-pill" data-active={format === f} onClick={() => setFormat(f)}>
              {WOD_FORMAT_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="pf-field">
        <label className="pf-field-label" htmlFor="wod-scheme">
          ESQUEMA (opcional)
        </label>
        <input id="wod-scheme" className="pf-input" value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="Ex.: 21-15-9, 3 rounds…" />
      </div>

      {isTimeBased && (
        <div className="pf-checkbox-row">
          <input id="wod-not-finished" type="checkbox" checked={notFinished} onChange={(e) => setNotFinished(e.target.checked)} />
          <label htmlFor="wod-not-finished">Não finalizei dentro do time cap</label>
        </div>
      )}

      {showTime && (
        <div className="pf-field">
          <label className="pf-field-label">TEMPO</label>
          <div className="pf-field-row">
            <input aria-label="Minutos" className="pf-input" inputMode="numeric" placeholder="min" value={min} onChange={(e) => setMin(e.target.value)} />
            <input aria-label="Segundos" className="pf-input" inputMode="numeric" placeholder="seg" value={sec} onChange={(e) => setSec(e.target.value)} />
          </div>
        </div>
      )}

      {showRounds && (
        <div className="pf-field">
          <label className="pf-field-label">{format === 'emom' ? 'RODADAS COMPLETAS' : 'RODADAS + REPS'}</label>
          <div className="pf-field-row">
            <input aria-label="Rounds" className="pf-input" inputMode="numeric" placeholder="rounds" value={rounds} onChange={(e) => setRounds(e.target.value)} />
            <input aria-label="Reps extras" className="pf-input" inputMode="numeric" placeholder="+ reps" value={extraReps} onChange={(e) => setExtraReps(e.target.value)} />
          </div>
        </div>
      )}

      {format === 'other' && (
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="wod-total-reps">
            REPS TOTAIS (opcional)
          </label>
          <input id="wod-total-reps" className="pf-input" inputMode="numeric" value={totalReps} onChange={(e) => setTotalReps(e.target.value)} />
        </div>
      )}

      <div className="pf-field">
        <label className="pf-field-label">RX / SCALED</label>
        <div className="pf-segmented">
          {SCALES.map((s) => (
            <button key={s} type="button" className="pf-pill" data-active={scale === s} onClick={() => setScale(s)}>
              {SCALE_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="pf-field">
        <label className="pf-field-label">RPE (esforço percebido)</label>
        <div className="pf-rpe-grid">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" className="pf-rpe-btn" data-active={rpe === n} onClick={() => setRpe(rpe === n ? null : n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="pf-icon-btn" style={{ width: 'auto', padding: '0 10px', alignSelf: 'flex-start' }} onClick={() => setExpanded((e) => !e)}>
        {expanded ? '▲ menos campos' : '▾ carga / calorias'}
      </button>
      {expanded && (
        <div className="pf-field-row">
          <div className="pf-field">
            <label className="pf-field-label" htmlFor="wod-load">
              CARGA (kg)
            </label>
            <input id="wod-load" className="pf-input" inputMode="decimal" value={loadKg} onChange={(e) => setLoadKg(e.target.value)} />
          </div>
          <div className="pf-field">
            <label className="pf-field-label" htmlFor="wod-cal">
              CALORIAS
            </label>
            <input id="wod-cal" className="pf-input" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
        </div>
      )}

      <div className="pf-field">
        <label className="pf-field-label" htmlFor="wod-notes">
          OBSERVAÇÕES
        </label>
        <textarea id="wod-notes" className="pf-textarea" style={{ minHeight: 56 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sensação, ajustes, contexto…" />
      </div>

      <div className="pf-modal-actions">
        <button className="pf-btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button className="pf-btn-primary" onClick={handleSave}>
          Salvar resultado
        </button>
      </div>
    </Modal>
  );
}
