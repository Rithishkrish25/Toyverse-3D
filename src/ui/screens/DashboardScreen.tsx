import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import { safeGetItem } from '../../utils/storageUtils';
import { TOY_DEFINITIONS } from '../../toys/toyRegistry';
import StarRating from '../../ui/components/StarRating';
import type { SessionResult, AchievementId } from '../../store/types';

const ACHIEVEMENT_META: { id: AchievementId; icon: string; nameKey: string }[] = [
  { id: 'first-stroke', icon: '🎨', nameKey: 'achievement.firstStroke.name' },
  { id: 'speed-painter', icon: '⚡', nameKey: 'achievement.speedPainter.name' },
  { id: 'perfect-painter', icon: '⭐', nameKey: 'achievement.perfectPainter.name' },
  { id: 'colour-explorer', icon: '🌈', nameKey: 'achievement.colourExplorer.name' },
  { id: 'toy-master', icon: '🏆', nameKey: 'achievement.toyMaster.name' },
];

const TOY_ICONS: Record<string, string> = {
  car: '🚗',
  bike: '🚲',
  lorry: '🚛',
};

/**
 * Dashboard screen — warm cream theme.
 * Shows session history, stats, and achievement gallery.
 */
export default function DashboardScreen(): React.ReactElement {
  const navigate = useNavigate();
  const locale = useGameStore((s) => s.locale);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [storedAchievements, setStoredAchievements] = useState<AchievementId[]>([]);

  useEffect(() => {
    try {
      const raw = safeGetItem('toyverse_sessions');
      if (raw) {
        const parsed = JSON.parse(raw) as SessionResult[];
        if (Array.isArray(parsed)) setSessions(parsed);
      }
    } catch { /* ignore */ }

    try {
      const raw = safeGetItem('toyverse_achievements');
      if (raw) {
        const parsed = JSON.parse(raw) as AchievementId[];
        if (Array.isArray(parsed)) setStoredAchievements(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const allUnlocked = new Set([...unlockedAchievements, ...storedAchievements]);
  const totalStars = sessions.reduce((sum, s) => sum + s.stars, 0);
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const bestAccuracy = sessions.length > 0 ? Math.max(...sessions.map((s) => s.accuracy)) : 0;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const card: React.CSSProperties = {
    background: '#fff', border: '1.5px solid #E8DDCA',
    borderRadius: '12px', padding: '16px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#FFF7E8', overflowY: 'auto', padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2D2D2D' }}>
          {t('dashboard.title', locale)}
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

      {/* Stats */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { emoji: '⭐', value: totalStars, label: t('dashboard.totalStars', locale) },
          { emoji: '🎮', value: sessions.length, label: t('dashboard.sessions', locale) },
          { emoji: '🏅', value: totalScore, label: t('hud.score', locale) },
          { emoji: '🎯', value: `${bestAccuracy}%`, label: t('hud.accuracy', locale) },
        ].map(({ emoji, value, label }) => (
          <div key={label} style={{ ...card, flex: '1 1 130px' }}>
            <div style={{ fontSize: '32px', lineHeight: 1 }}>{emoji}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#2D2D2D', marginTop: '4px' }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2D2D2D', marginBottom: '14px' }}>
        {t('dashboard.achievements', locale)}
      </h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {ACHIEVEMENT_META.map((ach) => {
          const isUnlocked = allUnlocked.has(ach.id);
          return (
            <div
              key={ach.id}
              style={{
                width: '100px', textAlign: 'center', padding: '14px 8px',
                borderRadius: '12px',
                background: isUnlocked ? '#FFF3E0' : '#fff',
                border: isUnlocked ? '2px solid #FF6B35' : '2px solid #E8DDCA',
                opacity: isUnlocked ? 1 : 0.45,
                filter: isUnlocked ? 'none' : 'grayscale(1)',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: '32px' }}>{ach.icon}</div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                {t(ach.nameKey, locale)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session history */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2D2D2D', marginBottom: '14px' }}>
        {t('dashboard.sessions', locale)}
      </h2>
      {sessions.length === 0 ? (
        <p style={{ color: '#888', fontSize: '16px', textAlign: 'center', padding: '40px' }}>
          {t('dashboard.empty', locale)}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.slice().reverse().map((session, idx) => {
            const toyDef = TOY_DEFINITIONS[session.toyId];
            const icon = TOY_ICONS[session.toyId] ?? '🎁';
            return (
              <div key={idx} style={{
                ...card, display: 'flex', alignItems: 'center',
                gap: '16px', textAlign: 'left', padding: '14px 18px',
              }}>
                <div style={{ fontSize: '34px' }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#2D2D2D', fontSize: '15px' }}>
                    {toyDef?.label[locale] ?? session.toyId}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    {formatDate(session.timestamp)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#FF6B35', fontSize: '18px', fontWeight: 800 }}>{session.score}</div>
                  <div style={{ color: '#888', fontSize: '11px' }}>{t('hud.score', locale)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 800 }}>{session.accuracy}%</div>
                  <div style={{ color: '#888', fontSize: '11px' }}>{t('hud.accuracy', locale)}</div>
                </div>
                <StarRating stars={session.stars} size={20} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
