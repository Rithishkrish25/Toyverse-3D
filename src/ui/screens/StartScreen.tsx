import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';

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
 * Displays TOYVERSE title, tagline, and a coral START GAME button.
 * Renders when phase === 'start'.
 */
export default function StartScreen(): React.ReactElement {
  const navigate = useNavigate();
  const locale = useGameStore((s) => s.locale);
  const startGame = useGameStore((s) => s.startGame);

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
        onClick={startGame}
        style={{
          padding: '18px 56px',
          fontSize: '20px',
          fontWeight: 700,
          background: '#FF6B35',
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255,107,53,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,107,53,0.45)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,53,0.35)';
        }}
      >
        {t('start.startGame', locale)}
      </button>
    </div>
  );
}
