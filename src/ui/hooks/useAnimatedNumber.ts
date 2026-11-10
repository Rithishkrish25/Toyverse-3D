import { useRef, useEffect, useState } from 'react';

/**
 * Animates a displayed number from the previous value to the new value
 * over a specified duration using requestAnimationFrame (Requirement 11.1).
 *
 * Uses easeOutCubic easing for a smooth deceleration toward the target.
 * Animation is cancelled on unmount and whenever the target changes,
 * preventing stale frames and visual jitter.
 *
 * @param target - The number to animate toward.
 * @param durationMs - Animation duration in milliseconds (default 400ms).
 * @returns The currently displayed (animated) number.
 */
export function useAnimatedNumber(target: number, durationMs = 400): number {
  const [displayValue, setDisplayValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = displayValue;
    startRef.current = null;

    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = fromRef.current + (target - fromRef.current) * eased;
      setDisplayValue(Math.round(current));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // intentionally exclude displayValue from deps so the effect captures
    // the current displayed value as the animation start point
  }, [target, durationMs]);

  return displayValue;
}
