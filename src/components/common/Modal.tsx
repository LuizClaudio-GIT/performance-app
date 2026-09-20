import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="pf-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="pf-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pf-modal-head">
          <div className="pf-modal-title">{title}</div>
          <button className="pf-modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="pf-modal-body">{children}</div>
      </div>
    </div>
  );
}
