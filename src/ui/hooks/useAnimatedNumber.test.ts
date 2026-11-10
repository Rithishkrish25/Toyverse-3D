import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useAnimatedNumber } from './useAnimatedNumber';

/**
 * Tests for useAnimatedNumber hook (Requirement 11.1).
 *
 * The hook animates a displayed number from its previous value to the new
 * target value using requestAnimationFrame with easeOutCubic easing.
 *
 * We mock requestAnimationFrame so we can deterministically control the
 * timestamps passed to the animation callback.
 */

// ---------------------------------------------------------------------------
// Mock requestAnimationFrame / cancelAnimationFrame helpers
// ---------------------------------------------------------------------------

let rafCallbacks: Array<(ts: number) => void> = [];

function mockRaf() {
  let idCounter = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: (ts: number) => void) => {
    rafCallbacks.push(cb);
    return ++idCounter;
  });
  vi.stubGlobal('cancelAnimationFrame', (_id: number) => {
    // We just drain on the next step; individual id tracking not needed for these tests
  });
}

/** Step through all currently pending RAF callbacks at the given timestamp. */
function stepFrame(ts: number) {
  const pending = [...rafCallbacks];
  rafCallbacks = [];
  for (const cb of pending) {
    cb(ts);
  }
}

/** Step through N frames at `msPerFrame` apart, starting at timestamp 0. */
function stepFrames(frames: number, msPerFrame = 16) {
  for (let i = 0; i < frames; i++) {
    act(() => stepFrame(i * msPerFrame));
  }
}

beforeEach(() => {
  rafCallbacks = [];
  mockRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------

describe('useAnimatedNumber', () => {
  it('returns the target value on initial render (no animation started yet)', () => {
    const { result } = renderHook(() => useAnimatedNumber(100));
    expect(result.current).toBe(100);
  });

  it('animates from an initial value to the new target and settles at target', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedNumber(target, 400),
      { initialProps: { target: 0 } },
    );

    expect(result.current).toBe(0);

    // Change target to 100
    act(() => { rerender({ target: 100 }); });

    // 400ms animation at ~16ms per frame ≈ 26 frames; run 30 to be safe
    stepFrames(30, 16);

    expect(result.current).toBe(100);
  });

  it('uses easeOutCubic easing: more than 50% progress by the mid-point in time', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedNumber(target, 400),
      { initialProps: { target: 0 } },
    );

    act(() => { rerender({ target: 100 }); });

    // Collect values across the first half of the animation (~200ms = 12 frames)
    const earlyValues: number[] = [];
    for (let i = 0; i < 13; i++) {
      act(() => stepFrame(i * 16));
      earlyValues.push(result.current);
    }

    // With easeOutCubic, at t=0.5 the eased progress is 1 - (0.5)^3 = 0.875
    // So at ~200ms, displayed value should be near 87-88, well above 50
    const midValue = result.current;
    expect(midValue).toBeGreaterThan(50);
  });

  it('respects a custom duration: animation still settles at target', () => {
    const { result, rerender } = renderHook(
      ({ target, dur }) => useAnimatedNumber(target, dur),
      { initialProps: { target: 0, dur: 800 } },
    );

    act(() => { rerender({ target: 100, dur: 800 }); });

    // 800ms / 16ms ≈ 50 frames; run 55 to be safe
    stepFrames(55, 16);

    expect(result.current).toBe(100);
  });

  it('cancels animation on unmount (cancelAnimationFrame is called)', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const { rerender, unmount } = renderHook(
      ({ target }) => useAnimatedNumber(target, 400),
      { initialProps: { target: 0 } },
    );

    act(() => { rerender({ target: 50 }); });
    stepFrames(2);

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('cancels a mid-animation when target changes and settles at the new target', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedNumber(target, 400),
      { initialProps: { target: 0 } },
    );

    // Start animating to 100
    act(() => { rerender({ target: 100 }); });
    stepFrames(5); // partway through

    const midValue = result.current;
    expect(midValue).toBeGreaterThan(0);
    expect(midValue).toBeLessThan(100);

    // Change target to 200 mid-animation
    act(() => { rerender({ target: 200 }); });
    stepFrames(30);

    // Should now be at the latest target, not 100
    expect(result.current).toBe(200);
  });

  it('handles animating to a negative target', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedNumber(target, 400),
      { initialProps: { target: 0 } },
    );

    act(() => { rerender({ target: -50 }); });
    stepFrames(30);

    expect(result.current).toBe(-50);
  });

  it('handles animating downward (target < current value)', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedNumber(target, 400),
      { initialProps: { target: 100 } },
    );

    expect(result.current).toBe(100);

    act(() => { rerender({ target: 0 }); });
    stepFrames(30);

    expect(result.current).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests
// Validates: Requirement 11.1
// ---------------------------------------------------------------------------

describe('useAnimatedNumber — property tests', () => {
  /**
   * Property: after animation completes, displayed value equals target.
   * Validates: Requirement 11.1
   */
  it('after animation completes, displayed value always equals target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: 50, max: 400 }),
        (initial, target, duration) => {
          fc.pre(initial !== target);

          rafCallbacks = [];

          const { result, rerender } = renderHook(
            ({ t }) => useAnimatedNumber(t, duration),
            { initialProps: { t: initial } },
          );

          act(() => { rerender({ t: target }); });

          // Step through enough frames to complete the animation
          const framesToComplete = Math.ceil(duration / 16) + 5;
          for (let i = 0; i < framesToComplete; i++) {
            act(() => stepFrame(i * 16));
          }

          expect(result.current).toBe(target);
        },
      ),
    );
  });

  /**
   * Property: displayed value stays within [min(from, to), max(from, to)] during animation.
   * Validates: Requirement 11.1 — no overshoot occurs with easeOutCubic.
   */
  it('displayed value stays within the range [from, to] throughout the animation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        (from, to) => {
          fc.pre(from !== to);

          rafCallbacks = [];

          const lo = Math.min(from, to);
          const hi = Math.max(from, to);

          const { result, rerender } = renderHook(
            ({ t }) => useAnimatedNumber(t, 400),
            { initialProps: { t: from } },
          );

          act(() => { rerender({ t: to }); });

          for (let i = 0; i < 30; i++) {
            act(() => stepFrame(i * 16));
            expect(result.current).toBeGreaterThanOrEqual(lo);
            expect(result.current).toBeLessThanOrEqual(hi);
          }

          // Final value must be exactly the target
          expect(result.current).toBe(to);
        },
      ),
    );
  });

  /**
   * Property: displayed value is always a rounded integer (no fractional numbers shown).
   * Validates: Requirement 11.1 — Math.round ensures integer display.
   */
  it('displayed value is always an integer throughout the animation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (from, to) => {
          fc.pre(from !== to);

          rafCallbacks = [];

          const { result, rerender } = renderHook(
            ({ t }) => useAnimatedNumber(t, 400),
            { initialProps: { t: from } },
          );

          act(() => { rerender({ t: to }); });

          for (let i = 0; i < 30; i++) {
            act(() => stepFrame(i * 16));
            expect(Number.isInteger(result.current)).toBe(true);
          }
        },
      ),
    );
  });
});
