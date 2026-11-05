import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ToyId } from '../store/types';
import EnvironmentSetup from './EnvironmentSetup';
import CameraController from './CameraController';

interface WorkshopCanvasProps {
  /** The currently active toy to render. Pass undefined on HomeScreen. */
  activeToyId?: ToyId;
  /** Lazy-loaded toy content to render inside the canvas. */
  children?: React.ReactNode;
}

/**
 * The R3F Canvas host for the TOYVERSE Workshop scene.
 * Provides WebGL renderer, camera, lights, and orbit controls.
 *
 * @param activeToyId - ToyId of the currently loaded toy; undefined on HomeScreen.
 * @param children - 3D content (toy model, painting controller) to render inside the canvas.
 * @returns The WebGL canvas with the Workshop scene.
 */
export default function WorkshopCanvas({
  children,
}: WorkshopCanvasProps): React.ReactElement {
  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      shadows
      dpr={[1, 2]}
    >
      <EnvironmentSetup />
      <CameraController />
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}
