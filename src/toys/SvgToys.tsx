import React from 'react';
import type { ToyId } from '../store/types';
import { MISSIONS } from '../missions/missionData';

export interface SvgToyProps {
  toyId: ToyId;
  partColors: Record<string, string>;
  onPartClick?: (partName: string) => void;
  /** If true, renders with target colours from MissionData (non-interactive). */
  targetMode?: boolean;
}

const STROKE = '#1a1a1a';
const SW = '2.5';

function getColor(
  partName: string,
  partColors: Record<string, string>,
  targetMode: boolean,
  toyId: ToyId
): string {
  if (targetMode) {
    const target = MISSIONS[toyId].targets.find((t) => t.partName === partName);
    return target?.targetColor ?? '#CCCCCC';
  }
  return partColors[partName] ?? '#FFFFFF';
}

/**
 * 2D SVG toy illustration supporting both target (coloured) and paintable (white) modes.
 * In paintable mode each region is clickable. Black outlines remain in both modes.
 */
export default function SvgToy({
  toyId,
  partColors,
  onPartClick,
  targetMode = false,
}: SvgToyProps): React.ReactElement {
  const gc = (p: string) => getColor(p, partColors, targetMode, toyId);
  const clickProps = (p: string) =>
    !targetMode && onPartClick
      ? { onClick: () => onPartClick(p), style: { cursor: 'pointer' } as React.CSSProperties }
      : { style: { cursor: 'default' } as React.CSSProperties };

  if (toyId === 'car') {
    return (
      <svg
        viewBox="0 0 320 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-label="Car colouring illustration"
      >
        {/* Body */}
        <path
          d="M25 115 L25 148 L295 148 L295 115 L265 92 L55 92 Z"
          fill={gc('body')}
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinejoin="round"
          {...clickProps('body')}
        />
        {/* Roof */}
        <path
          d="M78 92 L102 58 L218 58 L242 92 Z"
          fill={gc('roof')}
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinejoin="round"
          {...clickProps('roof')}
        />
        {/* Window */}
        <path
          d="M108 89 L124 63 L196 63 L212 89 Z"
          fill={gc('window')}
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinejoin="round"
          {...clickProps('window')}
        />
        {/* Bumper (front) */}
        <rect
          x="270" y="124" width="26" height="14" rx="4"
          fill={gc('bumper')}
          stroke={STROKE}
          strokeWidth={SW}
          {...clickProps('bumper')}
        />
        {/* Wheel front */}
        <circle
          cx="238" cy="152" r="26"
          fill={gc('wheel-front')}
          stroke={STROKE}
          strokeWidth={SW}
          {...clickProps('wheel-front')}
        />
        <circle cx="238" cy="152" r="11" fill="#DDDDDD" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
        {/* Wheel rear */}
        <circle
          cx="82" cy="152" r="26"
          fill={gc('wheel-rear')}
          stroke={STROKE}
          strokeWidth={SW}
          {...clickProps('wheel-rear')}
        />
        <circle cx="82" cy="152" r="11" fill="#DDDDDD" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
        {/* Door line detail */}
        <line x1="160" y1="93" x2="160" y2="143" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
        {/* Door handle */}
        <rect x="148" y="118" width="14" height="5" rx="2" fill={STROKE} style={{ pointerEvents: 'none' }} />
      </svg>
    );
  }

  if (toyId === 'bike') {
    return (
      <svg
        viewBox="0 0 300 210"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-label="Bike colouring illustration"
      >
        {/* Wheel rear */}
        <circle
          cx="72" cy="148" r="48"
          fill={gc('wheel-rear')}
          stroke={STROKE}
          strokeWidth={SW}
          {...clickProps('wheel-rear')}
        />
        <circle cx="72" cy="148" r="22" fill="#DDDDDD" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
        {/* Spokes rear */}
        {[0, 60, 120].map((deg) => (
          <line
            key={deg}
            x1={72 + 22 * Math.cos((deg * Math.PI) / 180)}
            y1={148 + 22 * Math.sin((deg * Math.PI) / 180)}
            x2={72 + 48 * Math.cos(((deg + 180) * Math.PI) / 180)}
            y2={148 + 48 * Math.sin(((deg + 180) * Math.PI) / 180)}
            stroke={STROKE} strokeWidth="1.2" style={{ pointerEvents: 'none' }}
          />
        ))}
        {/* Wheel front */}
        <circle
          cx="228" cy="148" r="48"
          fill={gc('wheel-front')}
          stroke={STROKE}
          strokeWidth={SW}
          {...clickProps('wheel-front')}
        />
        <circle cx="228" cy="148" r="22" fill="#DDDDDD" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
        {/* Spokes front */}
        {[30, 90, 150].map((deg) => (
          <line
            key={deg}
            x1={228 + 22 * Math.cos((deg * Math.PI) / 180)}
            y1={148 + 22 * Math.sin((deg * Math.PI) / 180)}
            x2={228 + 48 * Math.cos(((deg + 180) * Math.PI) / 180)}
            y2={148 + 48 * Math.sin(((deg + 180) * Math.PI) / 180)}
            stroke={STROKE} strokeWidth="1.2" style={{ pointerEvents: 'none' }}
          />
        ))}
        {/* Frame — large clickable area */}
        <path
          d="M72 148 L150 75 L228 148 M150 75 L150 115 L108 148 M150 75 L182 105"
          fill="none"
          stroke={gc('frame')}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...clickProps('frame')}
        />
        {/* Handlebar */}
        <path
          d="M180 104 L195 85 M180 104 L190 118"
          fill="none"
          stroke={gc('handlebar')}
          strokeWidth="6"
          strokeLinecap="round"
          {...clickProps('handlebar')}
        />
        {/* Seat */}
        <ellipse
          cx="140" cy="70" rx="26" ry="10"
          fill={gc('seat')}
          stroke={STROKE}
          strokeWidth={SW}
          {...clickProps('seat')}
        />
        {/* Seat post */}
        <line x1="150" y1="79" x2="150" y2="115" stroke={STROKE} strokeWidth="4" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
      </svg>
    );
  }

  // Lorry
  return (
    <svg
      viewBox="0 0 380 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="Lorry colouring illustration"
    >
      {/* Cargo box */}
      <rect
        x="22" y="65" width="200" height="88" rx="5"
        fill={gc('cargo')}
        stroke={STROKE}
        strokeWidth={SW}
        {...clickProps('cargo')}
      />
      {/* Cargo door line */}
      <line x1="122" y1="65" x2="122" y2="153" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      {/* Cargo bolt decorations */}
      {[40, 100, 160, 200].map((x) => (
        <React.Fragment key={x}>
          <circle cx={x} cy="72" r="3" fill={STROKE} style={{ pointerEvents: 'none' }} />
          <circle cx={x} cy="146" r="3" fill={STROKE} style={{ pointerEvents: 'none' }} />
        </React.Fragment>
      ))}
      {/* Cab */}
      <path
        d="M222 75 L222 153 L358 153 L358 105 L325 75 Z"
        fill={gc('cab')}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
        {...clickProps('cab')}
      />
      {/* Window */}
      <path
        d="M232 103 L232 138 L315 138 L315 103 L292 82 Z"
        fill={gc('window')}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
        {...clickProps('window')}
      />
      {/* Bumper */}
      <rect
        x="344" y="130" width="22" height="14" rx="4"
        fill={gc('bumper')}
        stroke={STROKE}
        strokeWidth={SW}
        {...clickProps('bumper')}
      />
      {/* Wheel front */}
      <circle
        cx="308" cy="162" r="26"
        fill={gc('wheel-front')}
        stroke={STROKE}
        strokeWidth={SW}
        {...clickProps('wheel-front')}
      />
      <circle cx="308" cy="162" r="11" fill="#DDDDDD" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      {/* Wheel rear */}
      <circle
        cx="75" cy="162" r="26"
        fill={gc('wheel-rear')}
        stroke={STROKE}
        strokeWidth={SW}
        {...clickProps('wheel-rear')}
      />
      <circle cx="75" cy="162" r="11" fill="#DDDDDD" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      {/* Exhaust */}
      <rect x="225" y="55" width="8" height="24" rx="3" fill="#888" stroke={STROKE} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
    </svg>
  );
}
