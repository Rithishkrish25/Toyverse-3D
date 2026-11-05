import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';

/**
 * Language toggle between English and Tamil. Persists to localStorage via
 * the store's setLocale action (Requirement 12.3).
 * @returns The language toggle UI.
 */
export default function LanguageToggle(): React.ReactElement {
  const locale = useGameStore((s) => s.locale);
  const setLocale = useGameStore((s) => s.setLocale);

  return (
    <div className="language-toggle">
      <label style={{ marginRight: '8px' }}>{t('settings.language', locale)}</label>
      <button
        className={`lang-btn${locale === 'en' ? ' active' : ''}`}
        onClick={() => setLocale('en')}
        style={{
          padding: '8px 16px',
          background: locale === 'en' ? '#4a90d9' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '4px',
        }}
      >
        {t('settings.english', locale)}
      </button>
      <button
        className={`lang-btn${locale === 'ta' ? ' active' : ''}`}
        onClick={() => setLocale('ta')}
        style={{
          padding: '8px 16px',
          background: locale === 'ta' ? '#4a90d9' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {t('settings.tamil', locale)}
      </button>
    </div>
  );
}
