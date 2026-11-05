import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import { TOY_DEFINITIONS_2D, MISSIONS } from '../../missions/missionData';
import StarRating from './StarRating';
import { computeStarRating } from '../../utils/mathUtils';

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '12px 32px',
  fontWeight: 700,
  fontSize: '16px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  boxShadow: `0 3px 12px ${bg}66`,
  minHeight: '44px',
});

/**
 * Results overlay — warm cream, shown after challenge ends.
 * Displays score, accuracy, per-part comparison, stars, Play Again, Home.
 */
export default function ResultsOverlay(): React.ReactElement | null {
  const navigate = useNavigate();
  const phase = useGameStore((s) => s.phase);
  const locale = useGameStore((s) => s.locale);
  const score = useGameStore((s) => s.score);
  const correctParts = useGameStore((s) => s.correctParts);
  const incorrectParts = useGameStore((s) => s.incorrectParts);
  const timeTaken = useGameStore((s) => s.timeTaken);
  const partColors = useGameStore((s) => s.partColors);
  const activeToyId = useGameStore((s) => s.activeToyId);
  const resetChallenge = useGameStore((s) => s.resetChallenge);
  const goHome = useGameStore((s) => s.goHome);

  if (phase !== 'complete' && phase !== 'timeout') return null;

  const stars = computeStarRating(score);
  const toyDef = activeToyId ? TOY_DEFINITIONS_2D[activeToyId] : null;
  const mission = activeToyId ? MISSIONS[activeToyId] : null;

  const handleHome = () => {
    goHome();
    navigate('/');
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(255,247,232,0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      zIndex: 50,
      padding: '28px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Title */}
      <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#2D2D2D', marginBottom: '6px', textAlign: 'center' }}>
        {phase === 'timeout' ? t('results.timeout', locale) : t('results.title', locale)}
      </h2>
      <div style={{ marginBottom: '20px' }}>
        <StarRating stars={stars} size={38} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
        {[
          { label: t('results.score', locale), value: `${score}`, color: '#FF6B35' },
          { label: t('results.accuracy', locale), value: `${score}%`, color: '#FF6B35' },
          { label: t('results.correctParts', locale), value: `${correctParts}`, color: '#4CAF50' },
          { label: t('results.incorrectParts', locale), value: `${incorrectParts}`, color: '#F44336' },
          { label: t('results.timeTaken', locale), value: `${timeTaken}s`, color: '#888' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#fff',
            border: '1.5px solid #E8DDCA',
            borderRadius: '12px',
            padding: '12px 18px',
            textAlign: 'center',
            minWidth: '85px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Per-part comparison */}
      {toyDef && mission && (
        <div style={{ width: '100%', maxWidth: '480px', marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#2D2D2D', marginBottom: '10px', textAlign: 'center' }}>
            {t('results.partComparison', locale)}
          </div>
          {toyDef.parts.map((part) => {
            const target = mission.targets.find((m) => m.partName === part.name);
            const targetColor = target?.targetColor ?? '#CCCCCC';
            const paintedColor = partColors[part.name] ?? '#FFFFFF';
            const isMatch = paintedColor.toUpperCase() === targetColor.toUpperCase();
            return (
              <div key={part.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#fff',
                border: '1.5px solid #E8DDCA',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '6px',
              }}>
                <span style={{ flex: 1, fontSize: '14px', color: '#2D2D2D', fontWeight: 500 }}>
                  {part.label[locale]}
                </span>
                <span style={{ fontSize: '11px', color: '#aaa' }}>{t('results.target', locale)}</span>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '4px',
                  background: targetColor, border: '1.5px solid #ccc',
                  display: 'inline-block', flexShrink: 0,
                }} title={targetColor} />
                <span style={{ fontSize: '11px', color: '#aaa' }}>{t('results.painted', locale)}</span>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '4px',
                  background: paintedColor, border: '1.5px solid #ccc',
                  display: 'inline-block', flexShrink: 0,
                }} title={paintedColor} />
                <span style={{
                  fontWeight: 700, fontSize: '13px',
                  color: isMatch ? '#4CAF50' : '#F44336',
                  minWidth: '62px', textAlign: 'right',
                }}>
                  {isMatch ? t('results.correct', locale) : t('results.incorrect', locale)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: '20px' }}>
        <button onClick={resetChallenge} style={btnStyle('#4CAF50')}>
          {t('results.playAgain', locale)}
        </button>
        <button
          onClick={() => { goHome(); navigate('/'); }}
          style={btnStyle('#4a90d9')}
        >
          {t('complete.chooseToy', locale)}
        </button>
        <button onClick={handleHome} style={btnStyle('#FF6B35')}>
          {t('results.home', locale)}
        </button>
      </div>
    </div>
  );
}
