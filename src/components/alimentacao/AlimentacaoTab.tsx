import { useState } from 'react';
import { formatDecimal } from '../../lib/date';
import { useAppState, useTodayMeals, useTodayWater } from '../../state/AppState';
import { dailyKcal, dailyProtein } from '../../state/logic';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import type { Meal } from '../../data/schema';
import { MealFormModal } from './MealFormModal';

const RADIUS = 44;
const CIRC = 2 * Math.PI * RADIUS;

export function AlimentacaoTab() {
  const { data, addMeal, updateMeal, deleteMeal, toggleMealDone, addWater } = useAppState();
  const { showToast } = useToast();
  const meals = useTodayMeals();
  const water = useTodayWater();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [deleting, setDeleting] = useState<Meal | null>(null);

  const kcal = dailyKcal(meals);
  const protein = dailyProtein(meals);
  const pct = Math.min(1, data.goals.kcalGoal > 0 ? kcal / data.goals.kcalGoal : 0);
  const dash = `${Math.round(CIRC * pct)} ${Math.round(CIRC)}`;
  const proteinPct = Math.min(100, data.goals.proteinGoal > 0 ? (protein / data.goals.proteinGoal) * 100 : 0);
  const waterPct = Math.min(100, (water / data.goals.waterGoalL) * 100);

  return (
    <div className="pf-page">
      <div className="pf-page-header">
        <div className="pf-page-title">
          ALIMEN-
          <br />
          TAÇÃO
        </div>
        <div className="pf-page-eyebrow">
          COMBUSTÍVEL
          <br />
          PARA EVOLUIR
        </div>
      </div>
      <div className="pf-underline" />

      <div className="pf-kcal-card">
        <div className="pf-kcal-ring">
          <svg width="104" height="104" viewBox="0 0 104 104">
            <circle cx="52" cy="52" r={RADIUS} fill="none" stroke="var(--pf-border-soft)" strokeWidth="9" />
            <circle
              cx="52"
              cy="52"
              r={RADIUS}
              fill="none"
              stroke="var(--pf-accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={dash}
              transform="rotate(-90 52 52)"
            />
          </svg>
          <div className="pf-kcal-ring-center">
            <div className="pf-kcal-now">{Math.round(kcal).toLocaleString('pt-BR')}</div>
            <div className="pf-kcal-goal">/ {data.goals.kcalGoal.toLocaleString('pt-BR')} kcal</div>
          </div>
        </div>
        <div className="pf-macros">
          <div>
            <div className="pf-macro-row">
              <span className="pf-macro-name">Proteína</span>
              <span className="pf-macro-val">
                {Math.round(protein)} / {data.goals.proteinGoal} g
              </span>
            </div>
            <div className="pf-progress-track pf-progress-track--thinner" style={{ marginTop: 6 }}>
              <div className="pf-progress-fill" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 9px' }}>
        <div className="pf-section-label">PLANO DO DIA</div>
        <button
          className="pf-btn-outline"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + REFEIÇÃO
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="pf-empty-state">Nenhuma refeição registrada hoje. Toque em "+ Refeição" para começar.</div>
      ) : (
        <div className="pf-meals-list">
          {meals.map((m) => {
            const on = m.done;
            return (
              <div
                className="pf-meal-row"
                key={m.id}
                style={{
                  border: `1px solid ${on ? 'rgba(198,255,0,.28)' : 'var(--pf-border)'}`,
                  background: on ? 'rgba(198,255,0,.04)' : 'var(--pf-surface)',
                }}
              >
                <div className="pf-meal-photo pf-placeholder">
                  <span className="pf-placeholder-label">FOTO</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pf-meal-name">{m.name}</div>
                  <div className="pf-meal-meta">
                    {m.time} · {m.kcal} kcal · P {m.protein} g
                  </div>
                  {m.items && <div className="pf-meal-items">{m.items}</div>}
                </div>
                <div className="pf-row-actions" style={{ flexDirection: 'column' }}>
                  <button
                    className="pf-meal-toggle"
                    style={{
                      border: `1.5px solid ${on ? 'var(--pf-accent)' : '#3A3F45'}`,
                      background: on ? 'var(--pf-accent)' : 'transparent',
                    }}
                    onClick={() => toggleMealDone(m.id)}
                    aria-label={on ? `Desmarcar ${m.name}` : `Marcar ${m.name} como feita`}
                  >
                    {on ? '✓' : ''}
                  </button>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="pf-icon-btn"
                      aria-label={`Editar ${m.name}`}
                      onClick={() => {
                        setEditing(m);
                        setFormOpen(true);
                      }}
                    >
                      ✎
                    </button>
                    <button className="pf-icon-btn" aria-label={`Excluir ${m.name}`} onClick={() => setDeleting(m)}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pf-water-card">
        <div style={{ flex: 1 }}>
          <div className="pf-water-head">
            <span style={{ fontSize: 13, fontWeight: 600 }}>Água</span>
            <span style={{ fontFamily: 'var(--pf-font-mono)', fontSize: 10, color: 'var(--pf-text-secondary)' }}>
              {formatDecimal(water)} / {formatDecimal(data.goals.waterGoalL)} L
            </span>
          </div>
          <div className="pf-progress-track" style={{ marginTop: 9 }}>
            <div className="pf-progress-fill" style={{ width: `${waterPct}%` }} />
          </div>
        </div>
        <button className="pf-water-add" onClick={() => addWater(0.25)} aria-label="Adicionar água">
          +
        </button>
      </div>

      {formOpen && (
        <MealFormModal
          initial={editing ?? undefined}
          onClose={() => setFormOpen(false)}
          onSave={(values) => {
            if (editing) {
              updateMeal(editing.id, values);
              showToast('Refeição atualizada!');
            } else {
              addMeal(values);
              showToast('Refeição adicionada!');
            }
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir refeição?"
          message={`"${deleting.name}" será removida permanentemente.`}
          confirmLabel="Excluir"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteMeal(deleting.id);
            showToast('Refeição excluída.');
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
