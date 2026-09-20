import { useState } from 'react';
import { Modal } from '../common/Modal';
import { todayISO } from '../../lib/date';
import type { MetricCategory } from '../../data/schema';

interface AddMetricModalProps {
  category: MetricCategory;
  defaultName?: string;
  defaultUnit?: string;
  onSave: (values: { name: string; value: number; unit: string; date: string }) => void;
  onClose: () => void;
}

export function AddMetricModal({ category, defaultName = '', defaultUnit = '', onSave, onClose }: AddMetricModalProps) {
  const [name, setName] = useState(defaultName);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(defaultUnit);
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState('');

  function handleSave() {
    if (!name.trim()) {
      setError('Dê um nome para a métrica.');
      return;
    }
    const n = Number(value.replace(',', '.'));
    if (!Number.isFinite(n)) {
      setError('Valor inválido.');
      return;
    }
    onSave({ name: name.trim(), value: n, unit: unit.trim() || '—', date });
    onClose();
  }

  return (
    <Modal title={category === 'measure' ? 'Registrar medida' : 'Registrar performance'} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="metric-name">
          NOME
        </label>
        <input id="metric-name" className="pf-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={category === 'measure' ? 'Ex.: Cintura' : 'Ex.: Deadlift'} autoFocus />
      </div>
      <div className="pf-field-row">
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="metric-value">
            VALOR
          </label>
          <input id="metric-value" className="pf-input" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
        </div>
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="metric-unit">
            UNIDADE
          </label>
          <input id="metric-unit" className="pf-input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, cm, reps…" />
        </div>
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="metric-date">
          DATA
        </label>
        <input id="metric-date" className="pf-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
