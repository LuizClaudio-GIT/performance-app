import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppState } from '../../state/AppState';
import { useToast } from '../common/Toast';

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { data, updateProfile } = useAppState();
  const { showToast } = useToast();
  const [name, setName] = useState(data.profile.name);
  const [box, setBox] = useState(data.profile.box);
  const [phase, setPhase] = useState(data.profile.phase);
  const [weekLabel, setWeekLabel] = useState(data.profile.weekLabel);

  function handleSave() {
    updateProfile({ name: name.trim() || data.profile.name, box: box.trim(), phase: phase.trim(), weekLabel: weekLabel.trim() });
    showToast('Perfil atualizado!');
    onClose();
  }

  return (
    <Modal title="Editar perfil" onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="p-name">
          NOME
        </label>
        <input id="p-name" className="pf-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="p-box">
          BOX
        </label>
        <input id="p-box" className="pf-input" value={box} onChange={(e) => setBox(e.target.value)} />
      </div>
      <div className="pf-field-row">
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="p-week">
            SEMANA
          </label>
          <input id="p-week" className="pf-input" value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} placeholder="Semana 01" />
        </div>
        <div className="pf-field">
          <label className="pf-field-label" htmlFor="p-phase">
            FASE
          </label>
          <input id="p-phase" className="pf-input" value={phase} onChange={(e) => setPhase(e.target.value)} placeholder="Foundation" />
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
