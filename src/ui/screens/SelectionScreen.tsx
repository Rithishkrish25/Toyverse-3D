import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import type { ToyId } from '../../store/types';

const TOYS: { id: ToyId; icon: string; labelEn: string; labelTa: string }[] = [
  { id: 'car', icon: '🚗', labelEn: 'Car', labelTa: 'கார்' },
  { id: 'bike', icon: '🚲', labelEn: 'Bike', labelTa: 'சைக்கிள்' },
  { id: 'lorry', icon: '🚛', labelEn: 'Lorry', labelTa: 'லாரி' },
];

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
 * Selection Screen — choose one of three vehicles to colour.
 * Renders when phase === 'selection'.
 */
export default function SelectionScreen(): React.ReactElement {
  const navigate = useNavigate();
  const locale = useGameStore((s) => s.locale);
  const selectToy = useGameStore((s) => s.selectToy);

  const handleSelect = (toyId: ToyId) => {
    selectToy(toyId);
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
          {t('start.dashboard', locale)}
        </button>
        <button onClick={() => navigate('/settings')} style={navBtnStyle}>
          {t('start.settings', locale)}
        </button>
      </nav>

      <h1 style={{
        fontSize: 'clamp(24px, 4vw, 36px)',
        fontWeight: 800,
        color: '#2D2D2D',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        {t('selection.title', locale)}
      </h1>
      <p style={{ color: '#888', marginBottom: '44px', fontSize: '16px', textAlign: 'center' }}>
        {t('selection.subtitle', locale)}
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {TOYS.map((toy) => (
          <button
            key={toy.id}
            onClick={() => handleSelect(toy.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 44px',
              background: '#fff',
              border: '2px solid #E8DDCA',
              borderRadius: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              transition: 'all 0.18s',
              minWidth: '160px',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.borderColor = '#FF6B35';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#E8DDCA';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
            }}
          >
            <span style={{ fontSize: '64px', lineHeight: 1, marginBottom: '12px' }}>{toy.icon}</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#2D2D2D' }}>
              {locale === 'ta' ? toy.labelTa : toy.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
