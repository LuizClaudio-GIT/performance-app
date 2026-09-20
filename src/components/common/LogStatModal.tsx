import { useState } from 'react';
import { Modal } from './Modal';

interface LogStatModalProps {
  title: string;
  label: string;
  unit: string;
  initialValue: number;
  onSave: (value: number) => void;
  onClose: () => void;
}

export function LogStatModal({ title, label, unit, initialValue, onSave, onClose }: LogStatModalProps) {
  const [value, setValue] = useState(String(initialValue).replace('.', ','));

  function handleSave() {
    const normalized = value.replace(',', '.').trim();
    const n = Number(normalized);
    if (!Number.isFinite(n) || n < 0) return;
    onSave(n);
    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="log-stat-value">
          {label} ({unit})
        </label>
        <input
          id="log-stat-value"
          className="pf-input"
          inputMode="decimal"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
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
