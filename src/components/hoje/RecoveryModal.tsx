import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppState } from '../../state/AppState';
import { useToast } from '../common/Toast';

function ScaleGrid({ count, value, onChange }: { count: number; value: number | null; onChange: (n: number | null) => void }) {
  return (
    <div className="pf-rpe-grid" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" className="pf-rpe-btn" data-active={value === n} onClick={() => onChange(value === n ? null : n)}>
          {n}
        </button>
      ))}
    </div>
  );
}

/** Simple self-report, not a diagnosis — just history/context for the athlete. */
export function RecoveryModal({ onClose }: { onClose: () => void }) {
  const { data, today, logRecovery } = useAppState();
  const { showToast } = useToast();
  const existing = data.recoveryLogs[today];
  const [rpe, setRpe] = useState<number | null>(existing?.rpe ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy ?? null);
  const [soreness, setSoreness] = useState<number | null>(existing?.soreness ?? null);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  function handleSave() {
    logRecovery(today, { rpe, energy, soreness, notes: notes.trim() });
    showToast('Recuperação registrada!');
    onClose();
  }

  return (
    <Modal title="Recuperação de hoje" onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label">RPE DO DIA (1-10)</label>
        <ScaleGrid count={10} value={rpe} onChange={setRpe} />
      </div>
      <div className="pf-field">
        <label className="pf-field-label">ENERGIA (1-5)</label>
        <ScaleGrid count={5} value={energy} onChange={setEnergy} />
      </div>
      <div className="pf-field">
        <label className="pf-field-label">DOR / DESCONFORTO (1-5)</label>
        <ScaleGrid count={5} value={soreness} onChange={setSoreness} />
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="recovery-notes">
          OBSERVAÇÕES
        </label>
        <textarea id="recovery-notes" className="pf-textarea" style={{ minHeight: 56 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sono, dor específica, contexto…" />
      </div>
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
