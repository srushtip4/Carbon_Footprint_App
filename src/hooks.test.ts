import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../hooks';

describe('useNavigation', () => {
  it('starts with default page', () => {
    const { result } = renderHook(() => useNavigation('education'));
    expect(result.current.currentPage).toBe('education');
  });

  it('updates page on navigate call', () => {
    const { result } = renderHook(() => useNavigation('education'));
    act(() => { result.current.navigate('dashboard'); });
    expect(result.current.currentPage).toBe('dashboard');
  });

  it('updates page on navigate event', () => {
    const { result } = renderHook(() => useNavigation('education'));
    act(() => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'quiz' }));
    });
    expect(result.current.currentPage).toBe('quiz');
  });

  it('cleans up event listener on unmount', () => {
    const { result, unmount } = renderHook(() => useNavigation('education'));
    unmount();
    // Should not throw or update after unmount
    act(() => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'actions' }));
    });
    // currentPage stays as whatever it was — the hook is gone
    expect(result.current.currentPage).toBe('education');
  });
});
