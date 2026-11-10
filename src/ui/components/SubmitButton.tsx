import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';

/**
 * Submit button — coral orange, visible only during painting/submitting phases.
 * Disabled and greyed out while results are being calculated.
 */
export default function SubmitButton(): React.ReactElement | null {
  const phase = useGameStore((s) => s.phase);
  const locale = useGameStore((s) => s.locale);
  const submitChallenge = useGameStore((s) => s.submitChallenge);

  if (phase !== 'painting' && phase !== 'submitting') return null;

  const isDisabled = phase === 'submitting';

  return (
    <button
      onClick={submitChallenge}
      disabled={isDisabled}
      aria-label={t('painting.submit', locale)}
      className="btn"
      style={{
        padding: '10px 28px',
        fontWeight: 700,
        fontSize: '15px',
        background: isDisabled ? '#ccc' : 'linear-gradient(135deg, #FF6B35, #FF8C42)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isDisabled ? 'none' : '0 3px 12px rgba(255,107,53,0.35)',
        minHeight: '44px',
      }}
    >
      {t('painting.submit', locale)}
    </button>
  );
}
