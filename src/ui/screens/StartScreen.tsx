import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import { LEVEL_TO_TOY } from '../../missions/missionData';

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
 * Start Screen — warm cream landing view.
 * START GAME goes directly to Level 1 (Car) without a selection screen.
 */
export default function StartScreen(): React.ReactElement {
  const navigate = useNavigate();
  const locale = useGameStore((s) => s.locale);
  const startGame = useGameStore((s) => s.startGame);

  const handleStart = () => {
    startGame();
    // Navigate directly to Level 1 toy
    navigate(`/paint/${LEVEL_TO_TOY[1]}`);
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
          {t('start.dashboard', locale)}
        </button>
        <button onClick={() => navigate('/settings')} style={navBtnStyle}>
          {t('start.settings', locale)}
        </button>
      </nav>

      {/* Hero */}
      <div style={{ fontSize: '72px', lineHeight: 1, marginBottom: '16px' }}>🎨</div>
      <h1 style={{
        fontSize: 'clamp(32px, 6vw, 52px)',
        fontWeight: 900,
        color: '#2D2D2D',
        marginBottom: '8px',
        letterSpacing: '-1px',
        textAlign: 'center',
      }}>
        {t('start.title', locale)}
      </h1>
      <p style={{ fontSize: '18px', color: '#888', marginBottom: '48px', textAlign: 'center' }}>
        {t('start.tagline', locale)}
      </p>

      <button
        onClick={handleStart}
        className="btn"
        style={{
          padding: '18px 56px',
          fontSize: '20px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255,107,53,0.4)',
          marginBottom: '32px',
        }}
      >
        {t('start.startGame', locale)}
      </button>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['🚗 3 Vehicles', '🎨 12 Colours', '⭐ 3 Star Ratings', '🏆 Achievements'].map((feat) => (
          <span key={feat} style={{
            padding: '6px 14px',
            background: 'rgba(255,107,53,0.08)',
            border: '1px solid rgba(255,107,53,0.2)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#FF6B35',
          }}>{feat}</span>
        ))}
      </div>
    </div>
  );
}
