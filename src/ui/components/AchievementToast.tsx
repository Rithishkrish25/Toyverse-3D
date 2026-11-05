import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';
import type { AchievementId } from '../../store/types';

const ACHIEVEMENT_ICONS: Record<AchievementId, string> = {
  'first-stroke': '🎨',
  'speed-painter': '⚡',
  'perfect-painter': '⭐',
  'colour-explorer': '🌈',
  'toy-master': '🏆',
};

/** Map achievement id → i18n name key (mirrors gameStore ACHIEVEMENT_DEFS). */
const ACHIEVEMENT_NAME_KEYS: Record<AchievementId, string> = {
  'first-stroke': 'achievement.firstStroke.name',
  'speed-painter': 'achievement.speedPainter.name',
  'perfect-painter': 'achievement.perfectPainter.name',
  'colour-explorer': 'achievement.colourExplorer.name',
  'toy-master': 'achievement.toyMaster.name',
};

/**
 * Achievement unlock notification toast. Displays for exactly 3 seconds then
 * auto-dismisses (Requirement 11.6). Uses CSS fade-in/out animation.
 *
 * @returns The toast element or null if no achievement is pending.
 */
export default function AchievementToast(): React.ReactElement | null {
  const pendingAchievementToast = useGameStore((s) => s.pendingAchievementToast);
  const dismissAchievementToast = useGameStore((s) => s.dismissAchievementToast);
  const locale = useGameStore((s) => s.locale);

  useEffect(() => {
    if (pendingAchievementToast) {
      const timer = setTimeout(() => {
        dismissAchievementToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pendingAchievementToast, dismissAchievementToast]);

  if (!pendingAchievementToast) return null;

  return (
    <div className="achievement-toast">
      <span className="toast-icon" style={{ fontSize: '32px' }}>
        {ACHIEVEMENT_ICONS[pendingAchievementToast]}
      </span>
      <span className="toast-text">
        {t(ACHIEVEMENT_NAME_KEYS[pendingAchievementToast], locale)}{' '}
        {t('achievement.unlocked', locale)}
      </span>
    </div>
  );
}
