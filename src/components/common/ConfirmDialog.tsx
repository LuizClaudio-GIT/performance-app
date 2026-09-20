import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  extraAction?: { label: string; onClick: () => void };
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
  extraAction,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="pf-confirm-message">{message}</p>
      <div className="pf-modal-actions" style={{ flexWrap: 'wrap' }}>
        <button className="pf-btn-outline" onClick={onCancel}>
          {cancelLabel}
        </button>
        {extraAction && (
          <button className="pf-btn-outline" onClick={extraAction.onClick}>
            {extraAction.label}
          </button>
        )}
        <button className={danger ? 'pf-btn-danger' : 'pf-btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
