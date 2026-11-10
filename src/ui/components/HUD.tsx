import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatTimer } from '../../utils/mathUtils';
import { TOY_DEFINITIONS_2D } from '../../missions/missionData';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

/**
 * HUD — shows timer (left), score (centre), and mission target colour hints (right).
 * Timer turns red and pulses when under 30 seconds.
 */
export default function HUD(): React.ReactElement {
  const remainingSeconds = useGameStore((s) => s.remainingSeconds);
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const activeMission = useGameStore((s) => s.activeMission);
  const locale = useGameStore((s) => s.locale);
  const activeToyId = useGameStore((s) => s.activeToyId);
  const partColors = useGameStore((s) => s.partColors);

  const animatedScore = useAnimatedNumber(score);

  const timerClass = remainingSeconds > 60 ? 'timer-calm'
    : remainingSeconds > 30 ? 'timer-warning'
    : 'timer-urgent';

  // Build part label map from toy definitions
  const toyDef = activeToyId ? TOY_DEFINITIONS_2D[activeToyId] : null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '6px 0',
      flexWrap: 'wrap',
    }}>
      {/* Timer — left */}
      <div
        className={timerClass}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 20px',
          border: `2px solid ${remainingSeconds > 60 ? '#E8DDCA' : remainingSeconds > 30 ? '#FFD700' : '#FF4444'}`,
          borderRadius: '10px',
          fontFamily: 'monospace',
          fontSize: '22px',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          userSelect: 'none',
        }}>
        <span style={{ fontSize: '18px' }}>⏱</span>
        {formatTimer(remainingSeconds)}
      </div>

      {/* Score — centre */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#fff',
        border: '2px solid #E8DDCA',
        borderRadius: '10px',
        fontSize: '18px',
        fontWeight: 700,
        color: '#FF6B35',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        userSelect: 'none',
      }}>
        🎯 {animatedScore}
      </div>

      {/* Target colour hints — right */}
      {activeMission && activeMission.targets.length > 0 && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '6px 12px',
          background: '#fff',
          border: '2px solid #E8DDCA',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          flexWrap: 'wrap',
        }}>
          {activeMission.targets.map((target) => {
            const partDef = toyDef?.parts.find((p) => p.name === target.partName);
            const label = partDef ? partDef.label[locale] : target.partName;
            // Check if this part is correctly painted (painted colour or default matches target)
            const fallbackColor = partDef?.defaultColor ?? '#CCCCCC';
            const currentColor = partColors[target.partName] ?? fallbackColor;
            const isCorrect = currentColor.toUpperCase() === target.targetColor.toUpperCase();
            return (
              <div
                key={target.partName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
                title={`${label}: ${target.targetColor}`}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: target.targetColor,
                  border: isCorrect ? '2.5px solid #22C55E' : '1.5px solid #ccc',
                  flexShrink: 0,
                  boxShadow: isCorrect ? '0 0 4px #22C55E' : 'none',
                }} />
                <span style={{
                  fontSize: '9px',
                  color: isCorrect ? '#22C55E' : '#888',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  maxWidth: '32px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontWeight: isCorrect ? 700 : 400,
                }}>
                  {label}
                </span>
                {isCorrect && <span style={{ fontSize: '10px', color: '#22C55E' }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
