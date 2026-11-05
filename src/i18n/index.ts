import { en } from './en';
import { ta } from './ta';
import type { Locale } from '../store/types';

const translations: Record<Locale, Record<string, string>> = { en, ta };

const warnedKeys = new Set<string>();

/**
 * Look up a translation key in the specified locale.
 * Falls back to English if the key is missing from the locale, logging a
 * console warning (Requirement 12.5).
 * @param key - The translation key.
 * @param locale - The active locale ('en' or 'ta').
 * @returns The translated string, or the English fallback, or the key itself.
 */
export function t(key: string, locale: Locale): string {
  const map = translations[locale];
  if (map && map[key] !== undefined) {
    return map[key];
  }
  // Fall back to English
  if (en[key] !== undefined) {
    if (locale !== 'en') {
      const warnKey = `${key}:${locale}`;
      if (!warnedKeys.has(warnKey)) {
        warnedKeys.add(warnKey);
        console.warn('i18n: missing key "%s" in locale "%s"', key, locale);
      }
    }
    return en[key];
  }
  // Key missing entirely — return the key itself
  return key;
}

/**
 * Get the default locale based on localStorage or 'en'.
 * @returns The persisted locale preference or 'en' as default.
 */
export function getDefaultLocale(): Locale {
  try {
    const val = localStorage.getItem('toyverse_locale');
    if (val === 'ta') return 'ta';
  } catch {
    // ignore
  }
  return 'en';
}
