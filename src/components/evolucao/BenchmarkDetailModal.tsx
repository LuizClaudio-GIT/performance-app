import { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAppState } from '../../state/AppState';
import { useToast } from '../common/Toast';
import { dayMonthShort } from '../../lib/date';
import { attemptsForWorkoutDef, bestDisplayAttempt, formatWodResultShort } from '../../state/workouts';
import { WodResultModal } from '../hoje/WodResultModal';
import { WorkoutDefModal } from './WorkoutDefModal';

export function BenchmarkDetailModal({ workoutDefId, onClose }: { workoutDefId: string; onClose: () => void }) {
  const { data, logWorkoutAttempt, deleteWorkoutAttempt, updateWorkoutDef, deleteWorkoutDef } = useAppState();
  const { showToast } = useToast();
  const [logOpen, setLogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingAttemptId, setDeletingAttemptId] = useState<string | null>(null);
  const [confirmDeleteDef, setConfirmDeleteDef] = useState(false);

  const def = data.workoutDefs.find((w) => w.id === workoutDefId);
  if (!def) return null;

  const attempts = attemptsForWorkoutDef(data, workoutDefId);
  const best = bestDisplayAttempt(attempts);

  return (
    <>
      <Modal title={def.name} onClose={onClose}>
        <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 10, color: 'var(--pf-text-secondary)', letterSpacing: '.08em' }}>
          {def.scheme || '—'} {def.movements.length > 0 && `· ${def.movements.map((m) => m.name).join(', ')}`}
        </div>

        {best ? (
          <div className="pf-card" style={{ padding: 14, marginTop: 4 }}>
            <div className="pf-section-label">MELHOR RESULTADO</div>
            <div style={{ fontFamily: 'var(--pf-font-display)', fontWeight: 700, fontSize: 28, marginTop: 4 }}>
              {formatWodResultShort(best.result)}
            </div>
            <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 9, color: 'var(--pf-text-faint)', marginTop: 4 }}>{dayMonthShort(best.date)}</div>
          </div>
        ) : (
          <div className="pf-empty-state">Nenhuma tentativa registrada ainda.</div>
        )}

        <button className="pf-btn-primary" style={{ padding: 12 }} onClick={() => setLogOpen(true)}>
          REGISTRAR TENTATIVA
        </button>

        {attempts.length > 0 && (
          <div>
            <div className="pf-section-label" style={{ margin: '14px 2px 6px' }}>
              HISTÓRICO
            </div>
            <div className="pf-card" style={{ padding: '4px 14px' }}>
              {attempts.map((a) => (
                <div className="pf-attempt-row" key={a.id}>
                  <div>
                    <div>{formatWodResultShort(a.result)}</div>
                    <div style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 8.5, color: 'var(--pf-text-faint)' }}>{dayMonthShort(a.date)}</div>
                  </div>
                  {a.id === best?.id && <span className="pf-pr-badge">MELHOR</span>}
                  <button className="pf-icon-btn" aria-label="Excluir tentativa" onClick={() => setDeletingAttemptId(a.id)}>
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pf-modal-actions" style={{ flexWrap: 'wrap' }}>
          <button className="pf-btn-outline" onClick={() => setEditOpen(true)}>
            Editar
          </button>
          {def.source === 'user' && (
            <button className="pf-btn-danger" onClick={() => setConfirmDeleteDef(true)}>
              Excluir WOD
            </button>
          )}
          <button className="pf-btn-primary" style={{ flex: 1 }} onClick={onClose}>
            Fechar
          </button>
        </div>
      </Modal>

      {logOpen && (
        <WodResultModal
          title={`Registrar tentativa — ${def.name}`}
          kind="benchmark"
          workoutDefId={def.id}
          initialLabel={def.name}
          initialPlan={{ format: def.format, timeCapSec: def.timeCapSec, scheme: def.scheme, movements: def.movements }}
          onSave={(input) => {
            const { isPR } = logWorkoutAttempt(input);
            showToast(isPR ? `Novo PR em ${def.name}! 🏆` : 'Tentativa registrada!');
          }}
          onClose={() => setLogOpen(false)}
        />
      )}

      {editOpen && (
        <WorkoutDefModal
          initial={def}
          onSave={(values) => {
            updateWorkoutDef(def.id, values);
            showToast('WOD atualizado!');
          }}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deletingAttemptId && (
        <ConfirmDialog
          title="Excluir tentativa?"
          message="Essa tentativa será removida do histórico permanentemente."
          confirmLabel="Excluir"
          danger
          onCancel={() => setDeletingAttemptId(null)}
          onConfirm={() => {
            deleteWorkoutAttempt(deletingAttemptId);
            showToast('Tentativa excluída.');
            setDeletingAttemptId(null);
          }}
        />
      )}

      {confirmDeleteDef && (
        <ConfirmDialog
          title="Excluir WOD?"
          message={`"${def.name}" será removido. As tentativas já registradas continuam no seu histórico, sem vínculo com este WOD.`}
          confirmLabel="Excluir"
          danger
          onCancel={() => setConfirmDeleteDef(false)}
          onConfirm={() => {
            deleteWorkoutDef(def.id);
            showToast('WOD excluído.');
            setConfirmDeleteDef(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
