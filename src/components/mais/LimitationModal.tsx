import { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Limitation } from '../../data/schema';

interface LimitationModalProps {
  initial?: Limitation;
  onSave: (values: { area: string; note: string; pct: number }) => void;
  onClose: () => void;
}

export function LimitationModal({ initial, onSave, onClose }: LimitationModalProps) {
  const [area, setArea] = useState(initial?.area ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [pct, setPct] = useState(String(initial?.pct ?? 0));

  function handleSave() {
    if (!area.trim()) return;
    const n = Math.max(0, Math.min(100, Number(pct) || 0));
    onSave({ area: area.trim(), note: note.trim(), pct: n });
    onClose();
  }

  return (
    <Modal title={initial ? 'Editar limitação' : 'Nova limitação'} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="lim-area">
          ÁREA
        </label>
        <input id="lim-area" className="pf-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex.: Dorsiflexão de tornozelo" autoFocus />
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="lim-note">
          OBSERVAÇÃO
        </label>
        <input id="lim-note" className="pf-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Como isso te limita hoje" />
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="lim-pct">
          EVOLUÇÃO (%)
        </label>
        <input id="lim-pct" className="pf-input" inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value)} />
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
