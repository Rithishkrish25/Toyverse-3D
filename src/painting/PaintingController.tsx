import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * Hook that provides the click handler for painting parts.
 * Reads the active colour from the store and dispatches paintPart.
 * If no colour is selected, it shows the "no palette" prompt instead.
 *
 * @param _toyId - The current toy id (unused but kept for API compatibility).
 * @returns An object with `handlePartClick` for wiring to mesh onPointerDown.
 */
export function usePaintingController(_toyId?: string): {
  handlePartClick: (partName: string) => void;
} {
  const activeColor = useGameStore((s) => s.activeColor);
  const paintPart = useGameStore((s) => s.paintPart);
  const showNoPalettePrompt = useGameStore((s) => s.showNoPalettePromptAction);

  const handlePartClick = useCallback(
    (partName: string) => {
      if (!activeColor) {
        showNoPalettePrompt();
        return;
      }
      paintPart(partName, activeColor);
    },
    [activeColor, paintPart, showNoPalettePrompt]
  );

  return { handlePartClick };
}
