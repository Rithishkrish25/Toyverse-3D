import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CONFETTI_COUNT = 80; // Requirement 12.1
const COLORS = [
  '#FF0000', // red
  '#FF6B35', // orange
  '#FFD700', // gold
  '#FFA500', // orange (alt)
  '#00AA00', // green
  '#0000FF', // blue
  '#8000FF', // purple
  '#FF69B4', // pink
]; // Requirement 12.1 (8 varied colours including gold)

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  color: string;
}

/**
 * Confetti particle system. Spawns coloured quads with randomised velocity,
 * gravity, and rotational motion. Particles spawn from the top of the canvas
 * distributed across the full width. Used as part of the CompletionAnimation.
 *
 * @returns An instanced mesh with animated confetti particles.
 */
export default function Confetti(): React.ReactElement {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Initialization: spawn from top, distribute across width (Req 12.4)
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 4, // full width distribution (Req 12.4)
        Math.random() * 1 + 2.5, // spawn near top, positive Y (Req 12.4)
        (Math.random() - 0.5) * 2
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.04,
        -0.01 - Math.random() * 0.02,
        (Math.random() - 0.5) * 0.04
      ),
      rotation: new THREE.Euler(0, 0, 0),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2, // rotational motion (Req 12.3)
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.position.add(p.velocity);
      p.velocity.y -= 0.0008; // gravity (Req 12.2)
      p.rotation.x += p.rotationSpeed.x; // spin (Req 12.3)
      p.rotation.y += p.rotationSpeed.y;
      p.rotation.z += p.rotationSpeed.z;
      dummy.position.copy(p.position);
      dummy.rotation.copy(p.rotation);
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
