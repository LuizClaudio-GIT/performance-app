import { useState } from 'react';
import { Modal } from '../common/Modal';
import type { ProgressionDef } from '../../data/schema';

interface ProgressionDefModalProps {
  initial?: ProgressionDef;
  onSave: (values: { name: string; steps: string[] }) => void;
  onClose: () => void;
}

export function ProgressionDefModal({ initial, onSave, onClose }: ProgressionDefModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [steps, setSteps] = useState<string[]>(initial?.steps.length ? initial.steps : ['']);
  const [error, setError] = useState('');

  function updateStep(i: number, value: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  }
  function addStep() {
    setSteps((prev) => [...prev, '']);
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (!name.trim()) {
      setError('Dê um nome para a progressão.');
      return;
    }
    if (cleanSteps.length < 2) {
      setError('Adicione pelo menos 2 etapas.');
      return;
    }
    onSave({ name: name.trim().toUpperCase(), steps: cleanSteps });
    onClose();
  }

  return (
    <Modal title={initial ? 'Editar progressão' : 'Nova progressão'} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="pdef-name">
          NOME DA HABILIDADE
        </label>
        <input id="pdef-name" className="pf-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: MUSCLE-UP" autoFocus />
      </div>
      <div className="pf-field">
        <label className="pf-field-label">ETAPAS, EM ORDEM</label>
        <div className="pf-movement-list">
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <input className="pf-input" style={{ padding: '8px 9px', fontSize: 13 }} placeholder={`Etapa ${i + 1}`} value={s} onChange={(e) => updateStep(i, e.target.value)} />
              <button type="button" className="pf-icon-btn" aria-label="Remover etapa" onClick={() => removeStep(i)} disabled={steps.length <= 1}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="pf-btn-outline" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12 }} onClick={addStep}>
          + ETAPA
        </button>
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
