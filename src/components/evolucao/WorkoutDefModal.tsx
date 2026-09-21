import { useState } from 'react';
import { Modal } from '../common/Modal';
import { WOD_FORMAT_LABEL, makeId, type WodFormat, type WodMovement, type WorkoutDef } from '../../data/schema';

const FORMATS: WodFormat[] = ['for-time', 'rounds-reps', 'amrap', 'emom', 'chipper', 'other'];

interface WorkoutDefModalProps {
  initial?: WorkoutDef;
  onSave: (values: { name: string; format: WodFormat; timeCapSec: number | null; scheme: string; movements: WodMovement[]; notes: string; isBenchmark: boolean }) => void;
  onClose: () => void;
}

export function WorkoutDefModal({ initial, onSave, onClose }: WorkoutDefModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [format, setFormat] = useState<WodFormat>(initial?.format ?? 'for-time');
  const [scheme, setScheme] = useState(initial?.scheme ?? '');
  const [timeCapMin, setTimeCapMin] = useState(initial?.timeCapSec ? String(Math.round(initial.timeCapSec / 60)) : '');
  const [movements, setMovements] = useState<WodMovement[]>(initial?.movements ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');

  function addMovement() {
    setMovements((prev) => [...prev, { id: makeId('wm'), name: '', reps: '', load: '' }]);
  }
  function updateMovement(id: string, patch: Partial<WodMovement>) {
    setMovements((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function removeMovement(id: string) {
    setMovements((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Dê um nome para o WOD.');
      return;
    }
    const capMin = Number(timeCapMin.replace(',', '.'));
    onSave({
      name: name.trim(),
      format,
      timeCapSec: timeCapMin.trim() !== '' && Number.isFinite(capMin) ? Math.round(capMin * 60) : null,
      scheme: scheme.trim(),
      movements: movements.filter((m) => m.name.trim()),
      notes: notes.trim(),
      isBenchmark: true,
    });
    onClose();
  }

  return (
    <Modal title={initial ? 'Editar WOD' : 'Novo WOD nomeado'} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="wdef-name">
          NOME
        </label>
        <input id="wdef-name" className="pf-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Segunda de força" autoFocus />
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
      <div className="pf-field-row">
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="wdef-scheme">
            ESQUEMA (opcional)
          </label>
          <input id="wdef-scheme" className="pf-input" value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="Ex.: 21-15-9" />
        </div>
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="wdef-cap">
            TIME CAP (min)
          </label>
          <input id="wdef-cap" className="pf-input" inputMode="numeric" value={timeCapMin} onChange={(e) => setTimeCapMin(e.target.value)} placeholder="opcional" />
        </div>
      </div>
      <div className="pf-field">
        <label className="pf-field-label">MOVIMENTOS</label>
        <div className="pf-movement-list">
          {movements.map((m) => (
            <div className="pf-movement-row" key={m.id}>
              <input className="pf-input" style={{ padding: '8px 9px', fontSize: 13 }} placeholder="movimento" value={m.name} onChange={(e) => updateMovement(m.id, { name: e.target.value })} />
              <input className="pf-input" style={{ padding: '8px 9px', fontSize: 13 }} placeholder="reps" value={m.reps} onChange={(e) => updateMovement(m.id, { reps: e.target.value })} />
              <input className="pf-input" style={{ padding: '8px 9px', fontSize: 13 }} placeholder="carga" value={m.load} onChange={(e) => updateMovement(m.id, { load: e.target.value })} />
              <button type="button" className="pf-icon-btn" aria-label="Remover movimento" onClick={() => removeMovement(m.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="pf-btn-outline" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12 }} onClick={addMovement}>
          + MOVIMENTO
        </button>
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="wdef-notes">
          OBSERVAÇÕES
        </label>
        <textarea id="wdef-notes" className="pf-textarea" style={{ minHeight: 56 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && <div style={{ color: '#ff8b7c', fontSize: 12.5 }}>{error}</div>}
      <div className="pf-modal-actions">
        <button className="pf-btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button className="pf-btn-primary" onClick={handleSave}>
          Salvar
        </button>
      </div>
    </Modal>
  );
}
