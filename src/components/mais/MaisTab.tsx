import { useRef, useState } from 'react';
import { useAppState } from '../../state/AppState';
import { computeStreakDays } from '../../state/logic';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { ClearDataModal } from './ClearDataModal';
import { GoalsModal } from './GoalsModal';
import { LimitationModal } from './LimitationModal';
import { ProfileModal } from './ProfileModal';
import { SessionHistoryModal } from './SessionHistoryModal';
import type { Limitation } from '../../data/schema';

type ModalKind = 'profile' | 'goals' | 'history' | 'clear' | null;

export function MaisTab() {
  const { data, setTab, setEvoTab, addLimitation, updateLimitation, deleteLimitation, exportData, importData, clearData } = useAppState();
  const { showToast } = useToast();
  const [modal, setModal] = useState<ModalKind>(null);
  const [editingLimitation, setEditingLimitation] = useState<Limitation | 'new' | null>(null);
  const [deletingLimitation, setDeletingLimitation] = useState<Limitation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sessionsCount = data.sessions.filter((s) => s.status === 'completed').length;
  const streak = computeStreakDays(data);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-backup-${data.profile.weekLabel.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup exportado!');
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importData(String(reader.result));
      if (result.ok) {
        showToast('Backup importado com sucesso!');
      } else {
        showToast(result.error || 'Não foi possível importar o arquivo.', 'error');
      }
    };
    reader.onerror = () => showToast('Não foi possível ler o arquivo.', 'error');
    reader.readAsText(file);
  }

  return (
    <div className="pf-page">
      <div className="pf-page-header">
        <div className="pf-page-title">MAIS</div>
        <div className="pf-page-eyebrow">
          O SEU
          <br />
          PROCESSO
        </div>
      </div>
      <div className="pf-underline" />

      <button className="pf-profile-card" style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => setModal('profile')}>
        <div className="pf-profile-photo pf-placeholder">
          <span className="pf-placeholder-label">FOTO</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pf-profile-name">{data.profile.name.toUpperCase()}</div>
          <div className="pf-profile-meta">
            {data.profile.box.toUpperCase()} · {data.profile.weekLabel.toUpperCase()} · {data.profile.phase.toUpperCase()}
          </div>
        </div>
        <span className="pf-icon-btn" aria-hidden="true">
          ✎
        </span>
      </button>

      <div className="pf-pair-grid">
        <div className="pf-pair-card">
          <div className="pf-pair-label">SESSÕES COMPLEMENTARES</div>
          <div className="pf-pair-value">{sessionsCount}</div>
        </div>
        <div className="pf-pair-card">
          <div className="pf-pair-label">SEQUÊNCIA ATUAL</div>
          <div className="pf-pair-value" style={{ color: 'var(--pf-accent)' }}>
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 9px' }}>
        <div className="pf-section-label">MINHAS LIMITAÇÕES</div>
        <button className="pf-icon-btn" onClick={() => setEditingLimitation('new')} aria-label="Adicionar limitação">
          +
        </button>
      </div>
      {data.limitations.length === 0 ? (
        <div className="pf-empty-state">Nenhuma limitação registrada.</div>
      ) : (
        <div className="pf-limitations-list">
          {data.limitations.map((l) => (
            <div className="pf-limitation-row" key={l.id}>
              <button style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => setEditingLimitation(l)}>
                <div className="pf-limitation-area">{l.area}</div>
                <div className="pf-limitation-note">{l.note}</div>
              </button>
              <div className="pf-limitation-bar-wrap">
                <div className="pf-progress-track pf-progress-track--thinner">
                  <div className="pf-progress-fill" style={{ width: `${l.pct}%` }} />
                </div>
                <div className="pf-limitation-pct">{l.pct}%</div>
              </div>
              <button className="pf-icon-btn" aria-label={`Excluir ${l.area}`} onClick={() => setDeletingLimitation(l)}>
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pf-section-label" style={{ margin: '20px 2px 9px' }}>
        ATALHOS
      </div>
      <div className="pf-shortcuts-list">
        <button
          className="pf-shortcut-row"
          onClick={() => {
            setTab('evo');
            setEvoTab('progressoes');
          }}
        >
          <div className="pf-shortcut-label">Progressões</div>
          <div className="pf-shortcut-hint">{data.progressions.length} habilidades</div>
          <div className="pf-shortcut-chevron">›</div>
        </button>
        <button className="pf-shortcut-row" onClick={() => setModal('history')}>
          <div className="pf-shortcut-label">Histórico de sessões</div>
          <div className="pf-shortcut-hint">{data.sessions.length} registros</div>
          <div className="pf-shortcut-chevron">›</div>
        </button>
        <button className="pf-shortcut-row" onClick={() => setTab('semana')}>
          <div className="pf-shortcut-label">Plano semanal do box</div>
          <div className="pf-shortcut-hint">{data.profile.weekLabel}</div>
          <div className="pf-shortcut-chevron">›</div>
        </button>
        <button className="pf-shortcut-row" onClick={() => setModal('goals')}>
          <div className="pf-shortcut-label">Minhas metas</div>
          <div className="pf-shortcut-hint">calorias · água · passos</div>
          <div className="pf-shortcut-chevron">›</div>
        </button>
      </div>

      <div className="pf-section-label" style={{ margin: '20px 2px 9px' }}>
        DADOS
      </div>
      <div className="pf-shortcuts-list">
        <button className="pf-shortcut-row" onClick={handleExport}>
          <div className="pf-shortcut-label">Exportar backup</div>
          <div className="pf-shortcut-hint">.json</div>
          <div className="pf-shortcut-chevron">↓</div>
        </button>
        <button className="pf-shortcut-row" onClick={() => fileInputRef.current?.click()}>
          <div className="pf-shortcut-label">Importar backup</div>
          <div className="pf-shortcut-hint">.json</div>
          <div className="pf-shortcut-chevron">↑</div>
        </button>
        <button className="pf-shortcut-row" onClick={() => setModal('clear')} style={{ color: '#ff8b7c' }}>
          <div className="pf-shortcut-label" style={{ color: '#ff8b7c' }}>
            Limpar dados
          </div>
          <div className="pf-shortcut-chevron">›</div>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = '';
        }}
      />

      <div className="pf-quote-banner">
        MAIS QUE UM APP.
        <br />
        É O SEU PROCESSO.
      </div>

      {modal === 'profile' && <ProfileModal onClose={() => setModal(null)} />}
      {modal === 'goals' && <GoalsModal onClose={() => setModal(null)} />}
      {modal === 'history' && <SessionHistoryModal onClose={() => setModal(null)} />}
      {modal === 'clear' && (
        <ClearDataModal
          onClose={() => setModal(null)}
          onDemo={() => {
            clearData('demo');
            showToast('Dados de demonstração restaurados.');
            setModal(null);
          }}
          onEmpty={() => {
            clearData('empty');
            showToast('Dados apagados.');
            setModal(null);
          }}
        />
      )}

      {editingLimitation && (
        <LimitationModal
          initial={editingLimitation === 'new' ? undefined : editingLimitation}
          onClose={() => setEditingLimitation(null)}
          onSave={(values) => {
            if (editingLimitation === 'new') {
              addLimitation(values);
              showToast('Limitação adicionada!');
            } else {
              updateLimitation(editingLimitation.id, values);
              showToast('Limitação atualizada!');
            }
          }}
        />
      )}

      {deletingLimitation && (
        <ConfirmDialog
          title="Excluir limitação?"
          message={`"${deletingLimitation.area}" será removida.`}
          confirmLabel="Excluir"
          danger
          onCancel={() => setDeletingLimitation(null)}
          onConfirm={() => {
            deleteLimitation(deletingLimitation.id);
            showToast('Limitação excluída.');
            setDeletingLimitation(null);
          }}
        />
      )}
    </div>
  );
}
