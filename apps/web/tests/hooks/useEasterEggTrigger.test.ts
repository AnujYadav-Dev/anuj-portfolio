import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEasterEggTrigger, disableAllStylesheets } from '@/hooks/useEasterEggTrigger';

describe('useEasterEggTrigger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calls onAction callback on every registerClick invocation', () => {
    const { result } = renderHook(() => useEasterEggTrigger());
    const mockAction = vi.fn();

    act(() => {
      result.current.registerClick(mockAction);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.registerClick(mockAction);
    });

    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  it('does not trigger stylesheet removal before reaching 10 clicks', () => {
    const styleEl = document.createElement('style');
    styleEl.textContent = 'body { color: red; }';
    document.head.appendChild(styleEl);

    const { result } = renderHook(() => useEasterEggTrigger());

    for (let i = 0; i < 9; i++) {
      act(() => {
        result.current.registerClick();
      });
    }

    expect(document.querySelectorAll('style')).toHaveLength(1);
  });

  it('triggers disableAllStylesheets when clicked 10 times rapidly', () => {
    const styleEl = document.createElement('style');
    styleEl.textContent = 'body { color: red; }';
    document.head.appendChild(styleEl);

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = '/styles.css';
    document.head.appendChild(linkEl);

    const { result } = renderHook(() => useEasterEggTrigger());

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.registerClick();
      });
    }

    // Both style and link elements should be removed from the DOM
    expect(document.querySelectorAll('style')).toHaveLength(0);
    expect(document.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(0);
  });

  it('resets click counter if there is a significant pause (>= 800ms)', () => {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);

    const { result } = renderHook(() => useEasterEggTrigger());

    // 5 clicks
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.registerClick();
      });
    }

    // Significant pause (850ms)
    act(() => {
      vi.advanceTimersByTime(850);
    });

    // 5 more clicks (total 10, but separated by pause)
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.registerClick();
      });
    }

    // Should NOT have triggered Easter egg because counter reset after pause
    expect(document.querySelectorAll('style')).toHaveLength(1);
  });

  it('observes and removes dynamically appended stylesheets once activated', async () => {
    // Activate Easter egg directly
    disableAllStylesheets();

    // Dynamically inject a new style tag
    const newStyle = document.createElement('style');
    newStyle.textContent = '.new-class { color: blue; }';
    document.head.appendChild(newStyle);

    // Dynamic link tag
    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = '/new.css';
    document.head.appendChild(newLink);

    // Wait for MutationObserver callback
    await vi.waitFor(() => {
      expect(document.querySelectorAll('style')).toHaveLength(0);
      expect(document.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(0);
    });
  });
});
