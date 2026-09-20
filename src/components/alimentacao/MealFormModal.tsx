import { useState } from 'react';
import { Modal } from '../common/Modal';
import { formatTimeNow } from '../../lib/date';
import type { Meal } from '../../data/schema';

interface MealFormModalProps {
  initial?: Meal;
  onSave: (values: { name: string; time: string; kcal: number; protein: number; items: string }) => void;
  onClose: () => void;
}

export function MealFormModal({ initial, onSave, onClose }: MealFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [time, setTime] = useState(initial?.time ?? formatTimeNow());
  const [kcal, setKcal] = useState(initial ? String(initial.kcal) : '');
  const [protein, setProtein] = useState(initial ? String(initial.protein) : '');
  const [items, setItems] = useState(initial?.items ?? '');
  const [error, setError] = useState('');

  function handleSave() {
    if (!name.trim()) {
      setError('Dê um nome para a refeição.');
      return;
    }
    const kcalNum = Number(kcal.replace(',', '.'));
    const proteinNum = Number(protein.replace(',', '.'));
    if (!Number.isFinite(kcalNum) || kcalNum < 0) {
      setError('Calorias inválidas.');
      return;
    }
    if (!Number.isFinite(proteinNum) || proteinNum < 0) {
      setError('Proteína inválida.');
      return;
    }
    onSave({ name: name.trim(), time, kcal: Math.round(kcalNum), protein: Math.round(proteinNum), items: items.trim() });
    onClose();
  }

  return (
    <Modal title={initial ? 'Editar refeição' : 'Nova refeição'} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="meal-name">
          NOME
        </label>
        <input id="meal-name" className="pf-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Almoço" autoFocus />
      </div>
      <div className="pf-field-row">
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="meal-time">
            HORÁRIO
          </label>
          <input id="meal-time" className="pf-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="meal-kcal">
            CALORIAS
          </label>
          <input id="meal-kcal" className="pf-input" inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="meal-protein">
          PROTEÍNA (g)
        </label>
        <input id="meal-protein" className="pf-input" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" />
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="meal-items">
          ALIMENTOS / QUANTIDADE
        </label>
        <textarea id="meal-items" className="pf-textarea" value={items} onChange={(e) => setItems(e.target.value)} placeholder="Ex.: 150g de frango, arroz, salada" />
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
