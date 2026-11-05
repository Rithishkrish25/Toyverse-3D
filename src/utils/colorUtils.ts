import * as THREE from 'three';

/**
 * Convert a CSS hex colour string to a Three.js Color instance.
 * @param hex - A CSS hex colour string, e.g. "#FF0000".
 * @returns A new THREE.Color initialised with the given hex value.
 */
export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Convert a Three.js Color to a CSS hex string (uppercase, prefixed with #).
 * @param color - A THREE.Color instance.
 * @returns A CSS hex string, e.g. "#FF0000".
 */
export function threeColorToHex(color: THREE.Color): string {
  return '#' + color.getHexString().toUpperCase();
}

/**
 * Compare two CSS hex colour strings for RGB equality (case-insensitive).
 * @param a - First hex colour string.
 * @param b - Second hex colour string.
 * @returns True if both colours resolve to the same RGB values.
 */
export function colorsMatch(a: string, b: string): boolean {
  return a.toUpperCase() === b.toUpperCase();
}
