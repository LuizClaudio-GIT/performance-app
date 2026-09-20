import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppStateProvider, useAppState } from './AppState';

function Harness() {
  const {
    tab,
    setTab,
    data,
    addMeal,
    updateMeal,
    deleteMeal,
    toggleMealDone,
    startSession,
    toggleSetDone,
    finishSession,
    showDone,
  } = useAppState();

  return (
    <div>
      <div data-testid="active-tab">{tab}</div>
      <button onClick={() => setTab('semana')}>ir-para-semana</button>

      <div data-testid="meal-count">{data.meals.length}</div>
      <button
        onClick={() =>
          addMeal({ name: 'Refeição Teste', time: '12:00', kcal: 300, protein: 20, items: 'teste' })
        }
      >
        add-meal
      </button>
      {data.meals.map((m) => (
        <div key={m.id} data-testid={`meal-${m.id}`}>
          <span>{m.name}</span>
          <span data-testid={`meal-done-${m.id}`}>{String(m.done)}</span>
          <button onClick={() => toggleMealDone(m.id)}>toggle-{m.id}</button>
          <button onClick={() => updateMeal(m.id, { kcal: 999 })}>edit-{m.id}</button>
          <button onClick={() => deleteMeal(m.id)}>delete-{m.id}</button>
        </div>
      ))}

      <button onClick={() => startSession('core')}>start-core</button>
      {data.activeSession && (
        <div data-testid="active-session">
          <span data-testid="session-block">{data.activeSession.blockId}</span>
          <button onClick={() => toggleSetDone(0, 0)}>toggle-set-0-0</button>
          <button onClick={finishSession}>finish</button>
        </div>
      )}
      <div data-testid="show-done">{String(showDone)}</div>
      <div data-testid="sessions-count">{data.sessions.length}</div>
    </div>
  );
}

function renderHarness() {
  return render(
    <AppStateProvider>
      <Harness />
    </AppStateProvider>,
  );
}

describe('AppState integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('navigates between tabs', async () => {
    const user = userEvent.setup();
    renderHarness();
    expect(screen.getByTestId('active-tab').textContent).toBe('hoje');
    await user.click(screen.getByText('ir-para-semana'));
    expect(screen.getByTestId('active-tab').textContent).toBe('semana');
  });

  it('creates, edits, toggles, and deletes a meal', async () => {
    const user = userEvent.setup();
    renderHarness();
    const before = Number(screen.getByTestId('meal-count').textContent);

    await user.click(screen.getByText('add-meal'));
    expect(Number(screen.getByTestId('meal-count').textContent)).toBe(before + 1);

    const newMealRow = screen.getByText('Refeição Teste').closest('div')!;
    const id = newMealRow.getAttribute('data-testid')!.replace('meal-', '');

    expect(screen.getByTestId(`meal-done-${id}`).textContent).toBe('false');
    await user.click(screen.getByText(`toggle-${id}`));
    expect(screen.getByTestId(`meal-done-${id}`).textContent).toBe('true');

    await user.click(screen.getByText(`edit-${id}`));
    // editing doesn't remove the row; re-query to make sure it's still there with same id
    expect(screen.getByTestId(`meal-${id}`)).toBeTruthy();

    await user.click(screen.getByText(`delete-${id}`));
    expect(Number(screen.getByTestId('meal-count').textContent)).toBe(before);
  });

  it('runs a session to completion and records it in history', async () => {
    const user = userEvent.setup();
    renderHarness();
    const sessionsBefore = Number(screen.getByTestId('sessions-count').textContent);

    await user.click(screen.getByText('start-core'));
    expect(screen.getByTestId('session-block').textContent).toBe('core');

    // "core" block has 2 exercises in the catalog; finish both
    await user.click(screen.getByText('toggle-set-0-0'));
    await user.click(screen.getByText('finish'));
    await user.click(screen.getByText('finish'));

    expect(screen.queryByTestId('active-session')).toBeNull();
    expect(screen.getByTestId('show-done').textContent).toBe('true');
    expect(Number(screen.getByTestId('sessions-count').textContent)).toBe(sessionsBefore + 1);
  });
});
