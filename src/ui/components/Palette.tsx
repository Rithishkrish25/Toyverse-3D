import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { PaletteColor } from '../../store/types';

const PALETTE_COLORS: PaletteColor[] = [
  { id: 'red', hex: '#FF0000' },
  { id: 'coral-orange', hex: '#FF6B35' },
  { id: 'yellow', hex: '#FFFF00' },
  { id: 'green', hex: '#00AA00' },
  { id: 'sky-blue', hex: '#87CEEB' },
  { id: 'blue', hex: '#0000FF' },
  { id: 'purple', hex: '#8000FF' },
  { id: 'pink', hex: '#FF69B4' },
  { id: 'brown', hex: '#8B4513' },
  { id: 'white', hex: '#FFFFFF' },
  { id: 'grey', hex: '#808080' },
  { id: 'black', hex: '#000000' },
];

/**
 * 12-colour painting palette. Each swatch is a minimum 44x44 px touch target.
 * Pre-selects red (#FF0000) on mount. Positioned at the bottom so it never
 * overlaps the central 3D canvas (Requirement 5.4).
 *
 * @returns The palette UI panel.
 */
export default function Palette(): React.ReactElement {
  const activeColor = useGameStore((s) => s.activeColor);
  const setActiveColor = useGameStore((s) => s.setActiveColor);
  const dismissNoPalettePrompt = useGameStore((s) => s.dismissNoPalettePrompt);

  const handleSwatchClick = (hex: string) => {
    setActiveColor(hex);
    dismissNoPalettePrompt();
  };

  return (
    <div className="palette" role="group" aria-label="Colour palette">
      {PALETTE_COLORS.map((color) => (
        <div
          key={color.id}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        >
          <button
            className={`palette-swatch${activeColor?.toUpperCase() === color.hex.toUpperCase() ? ' active' : ''}`}
            style={{
              backgroundColor: color.hex,
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '2px solid #E8DDCA',
            }}
            onClick={() => handleSwatchClick(color.hex)}
            aria-label={`Select colour ${color.id}`}
          />
          <span style={{ fontSize: '9px', color: '#888', textAlign: 'center', lineHeight: 1 }}>
            {color.id}
          </span>
        </div>
      ))}
    </div>
  );
}
