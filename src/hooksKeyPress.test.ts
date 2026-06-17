import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyPress } from '../hooks';

describe('useKeyPress', () => {
  it('starts as not pressed', () => {
    const { result } = renderHook(() => useKeyPress('Escape'));
    expect(result.current).toBe(false);
  });

  it('becomes true when key is pressed', () => {
    const { result } = renderHook(() => useKeyPress('Escape'));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current).toBe(true);
  });

  it('becomes false when key is released', () => {
    const { result } = renderHook(() => useKeyPress('Escape'));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current).toBe(true);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    });
    expect(result.current).toBe(false);
  });

  it('ignores other keys', () => {
    const { result } = renderHook(() => useKeyPress('Escape'));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current).toBe(false);
  });

  it('cleans up listeners on unmount', () => {
    const { result, unmount } = renderHook(() => useKeyPress('Escape'));
    unmount();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    // Should remain false since hook is unmounted
    expect(result.current).toBe(false);
  });
});
