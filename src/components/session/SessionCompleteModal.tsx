import { useAppState } from '../../state/AppState';

export function SessionCompleteModal() {
  const { showDone, closeDone } = useAppState();
  if (!showDone) return null;

  return (
    <div className="pf-done-overlay" role="dialog" aria-modal="true">
      <div className="pf-done-card">
        <div className="pf-done-check">✓</div>
        <div className="pf-done-title">SESSÃO CONCLUÍDA</div>
        <div className="pf-done-note">Trabalho complementar registrado no seu histórico.</div>
        <button className="pf-done-btn" onClick={closeDone}>
          VOLTAR PARA HOJE
        </button>
      </div>
    </div>
  );
}
