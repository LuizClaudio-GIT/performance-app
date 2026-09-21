import { useState } from 'react';
import { BLOCKS } from '../../data/catalog';
import { dayMonthLongUpper, weekdayLongUpper } from '../../lib/date';
import { useAppState } from '../../state/AppState';
import { Modal } from '../common/Modal';
import { WOD_FORMAT_LABEL, emptyWodPlan, makeId, type DayType, type WodFormat, type WodMovement } from '../../data/schema';
import { useToast } from '../common/Toast';

const TYPE_LABEL: Record<DayType, string> = { treino: 'Treino', leve: 'Leve', descanso: 'Descanso' };
const FORMATS: WodFormat[] = ['for-time', 'rounds-reps', 'amrap', 'emom', 'chipper', 'other'];

export function DayDetailModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { data, updateDayPlan, toggleBoxWorkoutDone } = useAppState();
  const { showToast } = useToast();
  const plan =
    data.dayPlans[date] ??
    { date, type: 'treino' as DayType, boxLabel: 'CrossFit', boxWorkoutTitle: 'WOD DO DIA', boxWorkoutBody: '', wodPlan: null, complementaryBlockIds: [], note: '' };

  const [type, setType] = useState<DayType>(plan.type);
  const [boxLabel, setBoxLabel] = useState(plan.boxLabel);
  const [boxWorkoutBody, setBoxWorkoutBody] = useState(plan.boxWorkoutBody);
  const [note, setNote] = useState(plan.note);
  const [blockIds, setBlockIds] = useState<string[]>(plan.complementaryBlockIds);
  const [structureOpen, setStructureOpen] = useState(!!plan.wodPlan && plan.wodPlan.movements.length > 0);
  const [format, setFormat] = useState<WodFormat>(plan.wodPlan?.format ?? 'for-time');
  const [scheme, setScheme] = useState(plan.wodPlan?.scheme ?? '');
  const [movements, setMovements] = useState<WodMovement[]>(plan.wodPlan?.movements ?? []);

  function toggleBlock(id: string) {
    setBlockIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

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
    const cleanMovements = movements.filter((m) => m.name.trim());
    updateDayPlan(date, {
      type,
      boxLabel,
      boxWorkoutTitle: plan.boxWorkoutTitle || 'WOD DO DIA',
      boxWorkoutBody,
      wodPlan: structureOpen && (scheme.trim() || cleanMovements.length > 0) ? { format, timeCapSec: plan.wodPlan?.timeCapSec ?? null, scheme, movements: cleanMovements } : cleanMovements.length > 0 ? { ...emptyWodPlan(), format, scheme, movements: cleanMovements } : null,
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

          <button type="button" className="pf-icon-btn" style={{ width: 'auto', padding: '0 10px', alignSelf: 'flex-start' }} onClick={() => setStructureOpen((v) => !v)}>
            {structureOpen ? '▲ ocultar estrutura do WOD' : '▾ estrutura do WOD (opcional)'}
          </button>
          {structureOpen && (
            <>
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
                <input id="wod-scheme" className="pf-input" value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="Ex.: 21-15-9" />
              </div>
              <div className="pf-field">
                <label className="pf-field-label">MOVIMENTOS</label>
                <div className="pf-movement-list">
                  {movements.map((m) => (
                    <div className="pf-movement-row" key={m.id}>
                      <input
                        className="pf-input"
                        style={{ padding: '8px 9px', fontSize: 13 }}
                        placeholder="movimento"
                        value={m.name}
                        onChange={(e) => updateMovement(m.id, { name: e.target.value })}
                      />
                      <input
                        className="pf-input"
                        style={{ padding: '8px 9px', fontSize: 13 }}
                        placeholder="reps"
                        value={m.reps}
                        onChange={(e) => updateMovement(m.id, { reps: e.target.value })}
                      />
                      <input
                        className="pf-input"
                        style={{ padding: '8px 9px', fontSize: 13 }}
                        placeholder="carga"
                        value={m.load}
                        onChange={(e) => updateMovement(m.id, { load: e.target.value })}
                      />
                      <button type="button" className="pf-icon-btn" aria-label="Remover movimento" onClick={() => removeMovement(m.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="pf-btn-outline" style={{ marginTop: 8, padding: '8px 12px', fontSize: 12 }} onClick={addMovement}>
                  + MOVIMENTO
                </button>
                <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9, color: 'var(--pf-text-faint)', marginTop: 6, lineHeight: 1.5 }}>
                  Adicionar os movimentos permite comparar tentativas e receber sugestão de complementar baseada neles.
                </div>
              </div>
            </>
          )}

          <div className="pf-checkbox-row">
            <input
              id="box-done"
              type="checkbox"
              checked={!!data.boxWorkoutDone[date]}
              onChange={() => toggleBoxWorkoutDone(date)}
            />
            <label htmlFor="box-done">Treino do box concluído (sem resultado detalhado)</label>
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
