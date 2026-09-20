import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppState } from '../../state/AppState';
import { useToast } from '../common/Toast';

export function GoalsModal({ onClose }: { onClose: () => void }) {
  const { data, updateGoals } = useAppState();
  const { showToast } = useToast();
  const [kcal, setKcal] = useState(String(data.goals.kcalGoal));
  const [protein, setProtein] = useState(String(data.goals.proteinGoal));
  const [water, setWater] = useState(String(data.goals.waterGoalL).replace('.', ','));
  const [steps, setSteps] = useState(String(data.goals.stepsGoal));

  function num(v: string, fallback: number): number {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  function handleSave() {
    updateGoals({
      kcalGoal: Math.round(num(kcal, data.goals.kcalGoal)),
      proteinGoal: Math.round(num(protein, data.goals.proteinGoal)),
      waterGoalL: num(water, data.goals.waterGoalL),
      stepsGoal: Math.round(num(steps, data.goals.stepsGoal)),
    });
    showToast('Metas atualizadas!');
    onClose();
  }

  return (
    <Modal title="Minhas metas" onClose={onClose}>
      <div className="pf-field-row">
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="g-kcal">
            CALORIAS / DIA
          </label>
          <input id="g-kcal" className="pf-input" inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        </div>
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="g-protein">
            PROTEÍNA (g)
          </label>
          <input id="g-protein" className="pf-input" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </div>
      </div>
      <div className="pf-field-row">
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="g-water">
            ÁGUA (L)
          </label>
          <input id="g-water" className="pf-input" inputMode="decimal" value={water} onChange={(e) => setWater(e.target.value)} />
        </div>
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="g-steps">
            PASSOS
          </label>
          <input id="g-steps" className="pf-input" inputMode="numeric" value={steps} onChange={(e) => setSteps(e.target.value)} />
        </div>
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
