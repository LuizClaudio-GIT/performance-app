import { dayMonthShort } from '../../lib/date';
import { useAppState } from '../../state/AppState';
import { Modal } from '../common/Modal';

const STATUS_LABEL: Record<string, string> = {
  completed: 'CONCLUÍDA',
  abandoned: 'ENCERRADA',
  'in-progress': 'EM ANDAMENTO',
};

export function SessionHistoryModal({ onClose }: { onClose: () => void }) {
  const { data } = useAppState();
  const sessions = [...data.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <Modal title="Histórico de sessões" onClose={onClose}>
      {sessions.length === 0 ? (
        <div className="pf-empty-state">Nenhuma sessão registrada ainda.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
          {sessions.map((s) => {
            const setsDone = s.exercises.reduce((sum, ex) => sum + ex.sets.filter((set) => set.done).length, 0);
            const setsTotal = s.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            return (
              <div key={s.id} style={{ border: '1px solid var(--pf-border)', borderRadius: 11, padding: '11px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--pf-font-display)', fontWeight: 700, fontSize: 18 }}>{s.blockName}</div>
                  <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9, color: 'var(--pf-text-secondary)' }}>{dayMonthShort(s.date)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span
                    style={{
                      fontFamily: 'var(--pf-font-mono)',
                      fontSize: 9,
                      letterSpacing: '.1em',
                      color: s.status === 'completed' ? 'var(--pf-accent)' : 'var(--pf-text-secondary)',
                    }}
                  >
                    {STATUS_LABEL[s.status]}
                  </span>
                  <span style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9, color: 'var(--pf-text-secondary)' }}>
                    {setsDone}/{setsTotal} séries
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="pf-modal-actions">
        <button className="pf-btn-primary" style={{ flex: 1 }} onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}
