import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatTimer } from '../../utils/mathUtils';

/**
 * HUD — shows only the countdown timer in the warm cream theme.
 * Turns red and pulses when under 30 seconds.
 */
export default function HUD(): React.ReactElement {
  const remainingSeconds = useGameStore((s) => s.remainingSeconds);
  const phase = useGameStore((s) => s.phase);
  const isLowTime = remainingSeconds < 30 && phase === 'painting';

  return (
    <div style={{ padding: '10px 16px' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 20px',
        background: isLowTime ? '#FF4444' : '#fff',
        border: `2px solid ${isLowTime ? '#FF4444' : '#E8DDCA'}`,
        borderRadius: '10px',
        fontFamily: 'monospace',
        fontSize: '22px',
        fontWeight: 700,
        color: isLowTime ? '#fff' : '#2D2D2D',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        animation: isLowTime ? 'pulse-timer 0.5s ease-in-out infinite alternate' : 'none',
        userSelect: 'none',
      }}>
        <span style={{ fontSize: '18px' }}>⏱</span>
        {formatTimer(remainingSeconds)}
      </div>
    </div>
  );
}
