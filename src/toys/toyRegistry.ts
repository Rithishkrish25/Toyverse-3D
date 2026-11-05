import React from 'react';
import { TOY_DEFINITIONS_2D } from '../missions/missionData';
import type { ToyId } from '../store/types';

export const TOY_IDS: ToyId[] = ['car', 'bike', 'lorry'];

// Re-export as TOY_DEFINITIONS for DashboardScreen compatibility
export const TOY_DEFINITIONS = TOY_DEFINITIONS_2D;

/**
 * Lazy-loaded 3D toy components, keyed by ToyId.
 * Part names in each model match missionData.ts exactly so click-to-paint
 * and scoring work without any changes to the store or mission engine.
 */
export const TOY_COMPONENTS: Record<ToyId, React.LazyExoticComponent<React.FC>> = {
  car: React.lazy(() => import('./models/Car3D')),
  bike: React.lazy(() => import('./models/Bike3D')),
  lorry: React.lazy(() => import('./models/Lorry3D')),
};
