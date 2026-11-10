import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { LEVEL_TO_TOY, TOTAL_LEVELS } from '../../missions/missionData';

const LEVEL_ICONS: Record<number, string> = { 1: '🚗', 2: '🚲', 3: '🚛' };
const LEVEL_NAMES: Record<number, string> = { 1: 'Car', 2: 'Bike', 3: 'Lorry' };

const navBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: '#fff',
  color: '#555',
  border: '1.5px solid #E8DDCA',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

/**
 * Level selection screen.
 * Shows three sequential levels: Car (1), Bike (2), Lorry (3).
 * Level 1 is always unlocked. Completing a level unlocks the next.
 */
export default function SelectionScreen(): React.ReactElement {
  const navigate = useNavigate();
  const selectLevel = useGameStore((s) => s.selectLevel);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const completedLevels = useGameStore((s) => s.completedLevels);

  const handleSelect = (level: number) => {
    if (!unlockedLevels.includes(level)) return;
    const toyId = LEVEL_TO_TOY[level];
    selectLevel(level);
    navigate(`/paint/${toyId}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF7E8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Nav */}
      <nav style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/dashboard')} style={navBtnStyle}>
          Dashboard
        </button>
        <button onClick={() => navigate('/settings')} style={navBtnStyle}>
          Settings
        </button>
      </nav>

      {/* Hero section */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>🎨</div>
        <p style={{ color: '#FF6B35', fontWeight: 700, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Toyverse 3D Workshop</p>
      </div>

      <h1 style={{
        fontSize: 'clamp(24px, 4vw, 36px)',
        fontWeight: 800,
        color: '#2D2D2D',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        Choose Your Level
      </h1>
      <p style={{ color: '#888', marginBottom: '36px', fontSize: '15px', textAlign: 'center' }}>
        Paint each toy to earn stars and unlock the next level
      </p>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => {
          const isUnlocked = unlockedLevels.includes(level);
          const isCompleted = completedLevels.includes(level);

          return (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              disabled={!isUnlocked}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '28px 40px',
                background: isUnlocked ? 'linear-gradient(135deg, #fff 0%, #FFF7E8 100%)' : '#f0ede8',
                border: isCompleted
                  ? '2px solid #4CAF50'
                  : isUnlocked
                    ? '2px solid #E8DDCA'
                    : '2px dashed #ccc',
                borderRadius: '20px',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                boxShadow: isUnlocked ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
                opacity: isUnlocked ? 1 : 0.5,
                transition: 'all 0.18s',
                minWidth: '150px',
                position: 'relative',
              }}
              onMouseOver={e => {
                if (!isUnlocked) return;
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.borderColor = isCompleted ? '#4CAF50' : '#FF6B35';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.2)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = isCompleted ? '#4CAF50' : isUnlocked ? '#E8DDCA' : '#ccc';
                e.currentTarget.style.boxShadow = isUnlocked ? '0 2px 12px rgba(0,0,0,0.07)' : 'none';
              }}
            >
              {/* Completion badge */}
              {isCompleted && (
                <span style={{
                  position: 'absolute', top: '10px', right: '12px',
                  fontSize: '18px',
                }}>✅</span>
              )}
              {/* Lock icon */}
              {!isUnlocked && (
                <span style={{
                  position: 'absolute', top: '10px', right: '12px',
                  fontSize: '18px',
                }}>🔒</span>
              )}

              <span style={{ fontSize: '20px', fontWeight: 700, color: '#aaa', marginBottom: '6px' }}>
                Level {level}
              </span>
              <span style={{ fontSize: '56px', lineHeight: 1, marginBottom: '10px' }}>
                {isUnlocked ? LEVEL_ICONS[level] : '❓'}
              </span>
              <span style={{ fontSize: '17px', fontWeight: 700, color: isUnlocked ? '#2D2D2D' : '#aaa' }}>
                {isUnlocked ? LEVEL_NAMES[level] : 'Locked'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
