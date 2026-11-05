import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CONFETTI_COUNT = 40;
const COLORS = ['#FF0000', '#FF8000', '#FFFF00', '#00AA00', '#0000FF', '#8000FF', '#FF69B4'];

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
}

/**
 * Confetti particle system. Spawns coloured quads with randomised velocity
 * and gravity. Used as part of the CompletionAnimation.
 *
 * @returns A points mesh with animated confetti particles.
 */
export default function Confetti(): React.ReactElement {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 2
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.04,
        -0.02 - Math.random() * 0.02,
        (Math.random() - 0.5) * 0.04
      ),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.position.add(p.velocity);
      p.velocity.y -= 0.0008;
      dummy.position.copy(p.position);
      dummy.scale.setScalar(0.06);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFETTI_COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
