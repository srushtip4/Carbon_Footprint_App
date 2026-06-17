import { describe, it, expect, vi } from 'vitest';
import { navigateTo, navigateToAuth, navigateToDashboard, navigateToQuiz } from '../services/navigation';
import { ROUTES } from '../constants';

describe('navigation service', () => {
  it('dispatches navigate event with correct detail', () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    navigateTo(ROUTES.DASHBOARD);
    expect(spy).toHaveBeenCalled();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toBe(ROUTES.DASHBOARD);
    spy.mockRestore();
  });

  it('navigateToAuth dispatches auth route', () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    navigateToAuth();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toBe(ROUTES.AUTH);
    spy.mockRestore();
  });

  it('navigateToDashboard dispatches dashboard route', () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    navigateToDashboard();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toBe(ROUTES.DASHBOARD);
    spy.mockRestore();
  });

  it('navigateToQuiz dispatches quiz route', () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    navigateToQuiz();
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toBe(ROUTES.QUIZ);
    spy.mockRestore();
  });
});
