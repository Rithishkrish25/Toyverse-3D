import React from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import StartScreen from './StartScreen';
import SelectionScreen from './SelectionScreen';

/**
 * HomeScreen — phase-aware landing view.
 * Renders StartScreen when phase === 'start', SelectionScreen when phase === 'selection'.
 * Falls back to StartScreen for any unexpected phase.
 */
export default function HomeScreen(): React.ReactElement {
  const location = useLocation();
  const phase = useGameStore((s) => s.phase);
  const locale = useGameStore((s) => s.locale);
  const notFound = (location.state as { notFound?: boolean })?.notFound;

  return (
    <>
      {notFound && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#FF6B35', color: '#fff',
          padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 600,
        }}>
          {t('error.pageNotFound', locale)}
        </div>
      )}
      {phase === 'start' && <StartScreen />}
      {phase === 'selection' && <SelectionScreen />}
      {phase !== 'start' && phase !== 'selection' && <SelectionScreen />}
    </>
  );
}
