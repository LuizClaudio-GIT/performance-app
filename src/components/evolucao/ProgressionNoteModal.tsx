import { useState } from 'react';
import { Modal } from '../common/Modal';

interface ProgressionNoteModalProps {
  title: string;
  confirmLabel: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

export function ProgressionNoteModal({ title, confirmLabel, onConfirm, onClose }: ProgressionNoteModalProps) {
  const [note, setNote] = useState('');

  return (
    <Modal title={title} onClose={onClose}>
      <div className="pf-field">
        <label className="pf-field-label" htmlFor="progression-note">
          OBSERVAÇÃO (opcional)
        </label>
        <textarea
          id="progression-note"
          className="pf-textarea"
          style={{ minHeight: 56 }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="O que mudou, o que observar na próxima etapa…"
          autoFocus
        />
      </div>
      <div className="pf-modal-actions">
        <button className="pf-btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="pf-btn-primary"
          onClick={() => {
            onConfirm(note.trim());
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
