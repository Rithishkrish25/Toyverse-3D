import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import { TOY_DEFINITIONS_2D, MISSIONS, LEVEL_TO_TOY, TOTAL_LEVELS } from '../../missions/missionData';
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
 * Results overlay — shown after challenge ends (complete or timeout).
 *
 * Navigation buttons:
 *   - Level 1 completed → "Next Level" (Bike) + "Play Again" + "Home"
 *   - Level 2 completed → "Next Level" (Lorry) + "Play Again" + "Home"
 *   - Level 3 completed → "Game Completed!" banner + "Play Again" + "Home"
 *   - Any timeout → "Play Again" + "Home"
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
  const currentLevel = useGameStore((s) => s.currentLevel);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const selectLevel = useGameStore((s) => s.selectLevel);
  const resetChallenge = useGameStore((s) => s.resetChallenge);
  const goHome = useGameStore((s) => s.goHome);

  if (phase !== 'complete' && phase !== 'timeout') return null;

  const stars = computeStarRating(score);
  const toyDef = activeToyId ? TOY_DEFINITIONS_2D[activeToyId] : null;
  const mission = activeToyId ? MISSIONS[activeToyId] : null;

  const isComplete = phase === 'complete';
  const nextLevel = currentLevel + 1;
  const hasNextLevel = nextLevel <= TOTAL_LEVELS && unlockedLevels.includes(nextLevel);
  const isGameOver = isComplete && currentLevel === TOTAL_LEVELS;

  // Compute accuracy from part results, not from score
  const totalParts = correctParts + incorrectParts;
  const accuracy = totalParts > 0 ? Math.round((correctParts / totalParts) * 100) : 0;

  const handleHome = () => {
    goHome();
    navigate('/');
  };

  const handleNextLevel = () => {
    const nextToyId = LEVEL_TO_TOY[nextLevel];
    selectLevel(nextLevel);
    navigate(`/paint/${nextToyId}`);
  };

  return (
    <div
      className="overlay-enter"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255,247,232,0.97), rgba(232,221,202,0.97))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        zIndex: 50,
        padding: '28px 20px',
        fontFamily: 'var(--font-body)',
      }}>
      {/* Game Completed banner */}
      {isGameOver && (
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), #FF8C42)',
          color: '#fff',
          padding: '16px 40px',
          borderRadius: 'var(--radius-large)',
          fontSize: '22px',
          fontWeight: 800,
          marginBottom: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(255,107,53,0.4)',
        }}>
          🏆 Game Completed! 🏆
        </div>
      )}

      {/* Trophy icon — shown on successful completion, not duplicated on game-over banner */}
      {!isGameOver && (stars > 0 || phase === 'complete') && (
        <div style={{ fontSize: '48px', lineHeight: 1, marginBottom: '8px' }}>🏆</div>
      )}

      {/* Perfect score celebration */}
      {stars === 3 && (
        <div style={{ fontSize: '26px', letterSpacing: '6px', marginBottom: '6px' }}>🎉✨🎊</div>
      )}

      {/* Title */}
      <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '6px', textAlign: 'center' }}>
        {phase === 'timeout' ? t('results.timeout', locale) : t('results.title', locale)}
      </h2>
      {isComplete && !isGameOver && (
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>
          Level {currentLevel} — {activeToyId ? activeToyId.charAt(0).toUpperCase() + activeToyId.slice(1) : ''}
        </p>
      )}
      <div style={{ marginBottom: '20px' }}>
        <StarRating stars={stars} size={38} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
        {[
          { label: t('results.score', locale),        value: `${score}`,        color: 'var(--color-primary)' },
          { label: t('results.accuracy', locale),     value: `${accuracy}%`,    color: 'var(--color-primary)' },
          { label: t('results.correctParts', locale), value: `${correctParts}`, color: 'var(--color-success)' },
          { label: t('results.incorrectParts', locale), value: `${incorrectParts}`, color: 'var(--color-danger)' },
          { label: t('results.timeTaken', locale),    value: `${timeTaken}s`,   color: '#888' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#fff',
            border: '1.5px solid var(--color-sand)',
            borderRadius: 'var(--radius-panel)',
            padding: 'var(--space-4) 18px',
            textAlign: 'center',
            minWidth: '85px',
            boxShadow: 'var(--shadow-1)',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Per-part comparison */}
      {toyDef && mission && (
        <div style={{ width: '100%', maxWidth: '480px', marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-dark)', marginBottom: '10px', textAlign: 'center' }}>
            {t('results.partComparison', locale)}
          </div>
          {toyDef.parts.map((part) => {
            const target = mission.targets.find((m) => m.partName === part.name);
            const targetColor = target?.targetColor ?? '#CCCCCC';
            // Use painted colour; fall back to defaultColor (not white) so
            // wheels that were never clicked still show as correctly black.
            const paintedColor = partColors[part.name] ?? part.defaultColor;
            const isMatch = paintedColor.toUpperCase() === targetColor.toUpperCase();
            return (
              <div key={part.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: '#fff',
                border: '1.5px solid var(--color-sand)',
                borderRadius: 'var(--radius-small)',
                padding: 'var(--space-2) var(--space-3)',
                marginBottom: 'var(--space-1)',
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
        {/* Next Level — only if current level completed with ≥1 star and next is unlocked */}
        {isComplete && hasNextLevel && (
          <button onClick={handleNextLevel} style={btnStyle('#FF6B35')}>
            ▶ Level {nextLevel} — {LEVEL_TO_TOY[nextLevel].charAt(0).toUpperCase() + LEVEL_TO_TOY[nextLevel].slice(1)}
          </button>
        )}

        {/* Play Again — replay the same level */}
        <button onClick={resetChallenge} style={btnStyle('#4CAF50')}>
          {t('results.playAgain', locale)}
        </button>

        {/* Home */}
        <button onClick={handleHome} style={btnStyle('#4a90d9')}>
          {t('results.home', locale)}
        </button>
      </div>
    </div>
  );
}
