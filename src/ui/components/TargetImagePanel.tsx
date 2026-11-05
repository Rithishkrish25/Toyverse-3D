import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Suspense } from 'react';
import type { ToyId } from '../../store/types';
import { ToyRenderModeProvider } from '../../toys/ToyRenderModeContext';
import ToyLoader from '../../toys/ToyLoader';
import EnvironmentSetup from '../../scene/EnvironmentSetup';
import { t } from '../../i18n';
import { useGameStore } from '../../store/gameStore';

/**
 * Auto-rotating group wrapper for the target image toy model.
 */
function AutoRotate({ children }: { children: React.ReactNode }): React.ReactElement {
  const groupRef = useRef<Group>(null);
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

interface TargetImagePanelProps {
  toyId: ToyId;
}

/**
 * TargetImagePanel — non-interactive R3F Canvas rendering the selected toy
 * with target colours from MissionData (via ToyRenderModeContext 'target' mode).
 * Auto-rotates for visual appeal. Canvas has pointer-events: none.
 * @param toyId - The toy to render with target colours.
 * @returns The target image panel element.
 */
export default function TargetImagePanel({ toyId }: TargetImagePanelProps): React.ReactElement {
  const locale = useGameStore((s) => s.locale);

  return (
    <div
      className="target-image-panel"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <div
        className="target-image-label"
        style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1,
          background: 'rgba(0,0,0,0.5)',
          padding: '2px 8px',
          borderRadius: '4px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {t('painting.targetImage', locale)}
      </div>
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        dpr={[1, 2]}
      >
        <EnvironmentSetup />
        <ToyRenderModeProvider value="target">
          <Suspense fallback={null}>
            <AutoRotate>
              <ToyLoader toyId={toyId} />
            </AutoRotate>
          </Suspense>
        </ToyRenderModeProvider>
      </Canvas>
    </div>
  );
}
