/**
 * Clamp a value between min and max (inclusive).
 * @param value - The value to clamp.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @returns The clamped value in [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two numbers.
 * @param a - Start value.
 * @param b - End value.
 * @param t - Interpolation factor in [0, 1].
 * @returns The interpolated value a + (b - a) * t.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert degrees to radians.
 * @param deg - Angle in degrees.
 * @returns Angle in radians.
 */
export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Format an integer number of seconds as a "MM:SS" string.
 * @param remainingSeconds - Integer seconds in [0, 599].
 * @returns A string in "MM:SS" format with both parts zero-padded to two digits.
 */
export function formatTimer(remainingSeconds: number): string {
  const s = Math.max(0, Math.floor(remainingSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Compute the star rating (0–3) from a numeric score.
 * @param score - The session score (≥ 0).
 * @returns 0 if score < 10; 1 if 10 ≤ score < 50; 2 if 50 ≤ score < 90; 3 if score ≥ 90.
 */
export function computeStarRating(score: number): 0 | 1 | 2 | 3 {
  if (score < 10) return 0;
  if (score < 50) return 1;
  if (score < 90) return 2;
  return 3;
}
