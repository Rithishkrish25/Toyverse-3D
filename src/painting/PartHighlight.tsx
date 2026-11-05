import { useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook providing hover handlers that toggle emissive glow on a mesh.
 * Does NOT alter material.color (Requirement 4.2).
 * @returns Pointer event handlers for hover glow effect.
 */
export function usePartHighlight(): {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
} {
  const onPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.object instanceof THREE.Mesh) {
      const mat = e.object.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.set(0x444444);
      }
    }
  }, []);

  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.object instanceof THREE.Mesh) {
      const mat = e.object.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.set(0x000000);
      }
    }
  }, []);

  return { onPointerOver, onPointerOut };
}
