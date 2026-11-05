/**
 * Safely read a value from localStorage.
 * @param key - The localStorage key.
 * @returns The stored string value, or null if not found or if storage is unavailable.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely write a value to localStorage.
 * @param key - The localStorage key.
 * @param value - The string value to store.
 * @returns True if the write succeeded; false if storage is unavailable.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely remove a key from localStorage.
 * @param key - The localStorage key to remove.
 * @returns True if the operation succeeded; false if storage is unavailable.
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
