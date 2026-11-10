import React, { useRef, useEffect, useCallback, useContext } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { ToyRenderModeContext } from './ToyRenderModeContext';

export interface PartMeshProps {
  /** Unique name for this part, used for raycasting and paint history */
  partName: string;
  /** Default color when no paint has been applied */
  defaultColor: string;
  /** Geometry element(s) as children */
  children: React.ReactNode;
  /** Position of the mesh */
  position?: [number, number, number];
  /** Rotation of the mesh */
  rotation?: [number, number, number];
  /** Scale of the mesh */
  scale?: [number, number, number] | number;
  /** PBR material override: metalness (0.0-1.0, default 0.1) — Requirement 7.1, 7.2 */
  metalness?: number;
  /** PBR material override: roughness (0.0-1.0, default 0.6) — Requirement 7.3, 7.4 */
  roughness?: number;
  /** PBR material override: transparent flag (default false) — Requirement 4.4 */
  transparent?: boolean;
  /** PBR material override: opacity (0.0-1.0, default 1.0) — Requirement 4.4 */
  opacity?: number;
  /** Whether the mesh casts shadows (default false) */
  castShadow?: boolean;
  /** Whether the mesh receives shadows (default false) */
  receiveShadow?: boolean;
}

/**
 * A mesh part for a toy that supports two render modes via ToyRenderModeContext:
 *
 * - **paintable** (default): Reads colour from GameStore.partColors with defaultColor
 *   fallback. Attaches pointer handlers for hover glow and click-to-paint.
 * - **target**: Reads colour from activeMission.targets by matching partName.
 *   Renders without pointer event handlers (non-interactive reference image).
 *
 * @param partName - Unique identifier for this part.
 * @param defaultColor - Hex color string used when no paint has been applied.
 * @param children - R3F geometry elements (e.g. <boxGeometry/>).
 * @param position - Mesh position [x, y, z].
 * @param rotation - Mesh rotation [x, y, z] in radians.
 * @param scale - Mesh scale, either uniform or [x, y, z].
 * @param metalness - PBR metalness (default 0.1).
 * @param roughness - PBR roughness (default 0.6).
 * @param transparent - Material transparency flag (default false).
 * @param opacity - Material opacity (default 1.0).
 * @returns A Three.js mesh with mode-appropriate colour and interaction behaviour.
 */
export default function PartMesh({
  partName,
  defaultColor,
  children,
  position,
  rotation,
  scale,
  metalness = 0.1,
  roughness = 0.6,
  transparent = false,
  opacity = 1.0,
  castShadow = false,
  receiveShadow = false,
}: PartMeshProps): React.ReactElement {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const renderMode = useContext(ToyRenderModeContext);

  // Paintable mode: read from partColors
  const partColorFromStore = useGameStore((s) => s.partColors[partName]);
  // Target mode: read from activeMission targets
  const activeMission = useGameStore((s) => s.activeMission);

  const activeColor = useGameStore((s) => s.activeColor);
  const paintPart = useGameStore((s) => s.paintPart);
  const showNoPalettePromptAction = useGameStore((s) => s.showNoPalettePromptAction);

  // Determine display colour based on render mode
  const displayColor =
    renderMode === 'target'
      ? (activeMission?.targets.find((t) => t.partName === partName)?.targetColor ?? defaultColor)
      : (partColorFromStore ?? defaultColor);

  // Apply color to material whenever it changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(displayColor);
    }
  }, [displayColor]);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (materialRef.current) {
      materialRef.current.emissive.set(0x999999);
    }
  }, []);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (materialRef.current) {
      materialRef.current.emissive.set(0x000000);
    }
  }, []);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!activeColor) {
      showNoPalettePromptAction();
      return;
    }
    // Flash effect (Requirement 10.3)
    if (materialRef.current) {
      materialRef.current.emissive.set(0xFFFFFF);
      materialRef.current.emissiveIntensity = 0.8;
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        if (materialRef.current) {
          materialRef.current.emissive.set(0x000000);
          materialRef.current.emissiveIntensity = 1.0;
        }
      }, 300);
    }
    paintPart(partName, activeColor);
  }, [activeColor, partName, paintPart, showNoPalettePromptAction]);

  // Cleanup flash timer on unmount
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  // In target mode: no pointer events
  const pointerHandlers = renderMode === 'paintable'
    ? {
        onPointerOver: handlePointerOver,
        onPointerOut: handlePointerOut,
        onPointerDown: handlePointerDown,
      }
    : {};

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ partName }}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      {...pointerHandlers}
    >
      {children}
      <meshStandardMaterial
        ref={materialRef}
        color={displayColor}
        roughness={roughness}
        metalness={metalness}
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  );
}
