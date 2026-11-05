import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import { safeGetItem, safeSetItem } from '../../utils/storageUtils';
import LanguageToggle from '../../ui/components/LanguageToggle';

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  border: '1.5px solid #E8DDCA',
  borderRadius: '14px',
  padding: '22px 24px',
  marginBottom: '18px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const labelStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '14px',
  marginBottom: '8px',
  display: 'block',
  fontWeight: 500,
};

/**
 * Settings screen — warm cream theme.
 * Language, sound, timer duration.
 */
export default function SettingsScreen(): React.ReactElement {
  const navigate = useNavigate();
  const locale = useGameStore((s) => s.locale);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  const [timerDuration, setTimerDuration] = useState(120);

  useEffect(() => {
    const s = safeGetItem('toyverse_sound_enabled');
    if (s !== null) setSoundEnabled(s === 'true');
    const v = safeGetItem('toyverse_volume');
    if (v !== null) setVolume(parseInt(v, 10));
    const d = safeGetItem('toyverse_timer_duration');
    if (d !== null) setTimerDuration(parseInt(d, 10));
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    safeSetItem('toyverse_sound_enabled', String(enabled));
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    safeSetItem('toyverse_volume', String(vol));
  };

  const handleTimerChange = (dur: number) => {
    const clamped = Math.min(600, Math.max(30, dur));
    setTimerDuration(clamped);
    safeSetItem('toyverse_timer_duration', String(clamped));
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 22px',
    background: active ? '#FF6B35' : '#f0ebe4',
    color: active ? '#fff' : '#555',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s',
    minHeight: '44px',
  });

  const quickBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    background: active ? '#FF6B35' : '#f0ebe4',
    color: active ? '#fff' : '#555',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF7E8',
      overflowY: 'auto',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2D2D2D' }}>
          {t('settings.title', locale)}
        </h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 22px', background: '#fff', color: '#555',
            border: '1.5px solid #E8DDCA', borderRadius: '10px', cursor: 'pointer',
            fontWeight: 600, fontSize: '14px',
          }}
        >
          ← {t('dashboard.back', locale)}
        </button>
      </div>

      {/* Language */}
      <div style={sectionStyle}>
        <h2 style={{ color: '#2D2D2D', marginBottom: '16px', fontSize: '17px', fontWeight: 700 }}>
          🌐 {t('settings.language', locale)}
        </h2>
        <LanguageToggle />
      </div>

      {/* Sound */}
      <div style={sectionStyle}>
        <h2 style={{ color: '#2D2D2D', marginBottom: '16px', fontSize: '17px', fontWeight: 700 }}>
          🔊 {t('settings.sound', locale)}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <label style={labelStyle}>{t('settings.soundEnabled', locale)}</label>
          <button onClick={() => handleSoundToggle(!soundEnabled)} style={toggleBtnStyle(soundEnabled)}>
            {soundEnabled ? t('settings.on', locale) : t('settings.off', locale)}
          </button>
        </div>
        {soundEnabled && (
          <div>
            <label style={labelStyle}>
              {t('settings.volume', locale)}: {volume}%
            </label>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              style={{ width: '100%', maxWidth: '300px', accentColor: '#FF6B35' }}
            />
          </div>
        )}
      </div>

      {/* Timer */}
      <div style={sectionStyle}>
        <h2 style={{ color: '#2D2D2D', marginBottom: '16px', fontSize: '17px', fontWeight: 700 }}>
          ⏱ {t('settings.timerDuration', locale)}
        </h2>
        <label style={labelStyle}>
          {t('settings.durationSeconds', locale)}: {timerDuration}s
        </label>
        <input
          type="range" min={30} max={600} step={30} value={timerDuration}
          onChange={(e) => handleTimerChange(parseInt(e.target.value, 10))}
          style={{ width: '100%', maxWidth: '300px', marginBottom: '12px', accentColor: '#FF6B35' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[60, 120, 180, 300].map((d) => (
            <button key={d} onClick={() => handleTimerChange(d)} style={quickBtnStyle(timerDuration === d)}>
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div style={sectionStyle}>
        <h2 style={{ color: '#2D2D2D', marginBottom: '8px', fontSize: '17px', fontWeight: 700 }}>ℹ️ About</h2>
        <p style={{ color: '#888', fontSize: '14px' }}>TOYVERSE – Colouring Challenge</p>
        <p style={{ color: '#bbb', fontSize: '12px', marginTop: '4px' }}>v0.1.0 · React + Zustand + SVG</p>
      </div>
    </div>
  );
}
