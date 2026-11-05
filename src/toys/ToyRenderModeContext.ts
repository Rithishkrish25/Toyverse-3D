import { createContext } from 'react';

/**
 * Render mode for toy parts.
 * - 'paintable': PartMesh reads colours from GameStore.partColors with #CCCCCC fallback, attaches pointer handlers
 * - 'target': PartMesh reads colours from MissionData.targets, renders without pointer handlers
 */
export type ToyRenderMode = 'paintable' | 'target';

export const ToyRenderModeContext = createContext<ToyRenderMode>('paintable');

export const ToyRenderModeProvider = ToyRenderModeContext.Provider;
