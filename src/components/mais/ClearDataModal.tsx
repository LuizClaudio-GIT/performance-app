import { Modal } from '../common/Modal';

export function ClearDataModal({ onEmpty, onDemo, onClose }: { onEmpty: () => void; onDemo: () => void; onClose: () => void }) {
  return (
    <Modal title="Limpar dados" onClose={onClose}>
      <p className="pf-confirm-message">
        Isso não pode ser desfeito. Escolha uma opção — os dados atuais (refeições, sessões, peso, medidas, programação) serão removidos.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="pf-btn-outline" style={{ padding: 12 }} onClick={onDemo}>
          Restaurar dados de demonstração
        </button>
        <button className="pf-btn-danger" style={{ padding: 12 }} onClick={onEmpty}>
          Apagar tudo (começar vazio)
        </button>
        <button className="pf-btn-outline" style={{ padding: 12 }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
