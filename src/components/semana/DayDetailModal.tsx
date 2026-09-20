import { useState } from 'react';
import { BLOCKS } from '../../data/catalog';
import { dayMonthLongUpper, weekdayLongUpper } from '../../lib/date';
import { useAppState } from '../../state/AppState';
import { Modal } from '../common/Modal';
import type { DayType } from '../../data/schema';
import { useToast } from '../common/Toast';

const TYPE_LABEL: Record<DayType, string> = { treino: 'Treino', leve: 'Leve', descanso: 'Descanso' };

export function DayDetailModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { data, updateDayPlan, toggleBoxWorkoutDone } = useAppState();
  const { showToast } = useToast();
  const plan = data.dayPlans[date] ?? { date, type: 'treino' as DayType, boxLabel: 'CrossFit', boxWorkoutTitle: 'WOD DO DIA', boxWorkoutBody: '', complementaryBlockIds: [], note: '' };

  const [type, setType] = useState<DayType>(plan.type);
  const [boxLabel, setBoxLabel] = useState(plan.boxLabel);
  const [boxWorkoutBody, setBoxWorkoutBody] = useState(plan.boxWorkoutBody);
  const [note, setNote] = useState(plan.note);
  const [blockIds, setBlockIds] = useState<string[]>(plan.complementaryBlockIds);

  function toggleBlock(id: string) {
    setBlockIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  function handleSave() {
    updateDayPlan(date, {
      type,
      boxLabel,
      boxWorkoutTitle: plan.boxWorkoutTitle || 'WOD DO DIA',
      boxWorkoutBody,
      note,
      complementaryBlockIds: blockIds,
    });
    showToast('Programação do dia salva!');
    onClose();
  }

  return (
    <Modal title={`${weekdayLongUpper(date)} · ${dayMonthLongUpper(date)}`} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="day-type">
          TIPO DE DIA
        </label>
        <select id="day-type" className="pf-select" value={type} onChange={(e) => setType(e.target.value as DayType)}>
          {(['treino', 'leve', 'descanso'] as DayType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      {type === 'treino' && (
        <>
          <div className="pf-field">
            <label className="pf-field-label" htmlFor="box-label">
              TREINO DO BOX
            </label>
            <input id="box-label" className="pf-input" value={boxLabel} onChange={(e) => setBoxLabel(e.target.value)} placeholder="Ex.: CrossFit" />
          </div>
          <div className="pf-field">
            <label className="pf-field-label" htmlFor="wod-body">
              WOD / DESCRIÇÃO
            </label>
            <textarea
              id="wod-body"
              className="pf-textarea"
              value={boxWorkoutBody}
              onChange={(e) => setBoxWorkoutBody(e.target.value)}
              placeholder={'For time:\n500m Row\n...'}
            />
          </div>
          <div className="pf-checkbox-row">
            <input
              id="box-done"
              type="checkbox"
              checked={!!data.boxWorkoutDone[date]}
              onChange={() => toggleBoxWorkoutDone(date)}
            />
            <label htmlFor="box-done">Treino do box concluído</label>
          </div>
        </>
      )}

      {type !== 'treino' && (
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="day-note">
            OBSERVAÇÃO
          </label>
          <input id="day-note" className="pf-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: Recuperação" />
        </div>
      )}

      <div className="pf-field">
        <label className="pf-field-label">DESENVOLVIMENTO COMPLEMENTAR</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BLOCKS.map((b) => (
            <label className="pf-checkbox-row" key={b.id} style={{ border: '1px solid var(--pf-border)', borderRadius: 10, padding: '10px 12px' }}>
              <input type="checkbox" checked={blockIds.includes(b.id)} onChange={() => toggleBlock(b.id)} />
              <span>
                {b.name} <span style={{ color: 'var(--pf-text-secondary)', fontSize: 11.5 }}>· {b.meta}</span>
              </span>
            </label>
          ))}
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
