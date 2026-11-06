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
 * @returns A Three.js mesh with mode-appropriate colour and interaction behaviour.
 */
export default function PartMesh({
  partName,
  defaultColor,
  children,
  position,
  rotation,
  scale,
}: PartMeshProps): React.ReactElement {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

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
      materialRef.current.emissive.set(0x666666);
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
    paintPart(partName, activeColor);
  }, [activeColor, partName, paintPart, showNoPalettePromptAction]);

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
      {...pointerHandlers}
    >
      {children}
      <meshStandardMaterial ref={materialRef} color={displayColor} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}
