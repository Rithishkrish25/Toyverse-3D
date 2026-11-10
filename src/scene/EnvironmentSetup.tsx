import React from 'react';
import { Environment, Grid } from '@react-three/drei';

/**
 * Sets up the 3D environment for the Workshop scene: 3-point lighting rig
 * with shadow casting, a shadow-receiving ground plane, grid floor pattern,
 * subtle fog, and an Environment map for PBR reflections.
 *
 * Lighting — Requirements 8.1, 8.2, 8.3
 * Grid/fog/background/Environment — Requirements 8.4, 8.5, 8.6, 8.7
 *
 * Ensures no Part surface renders as fully unlit (Requirement 2.3).
 *
 * @returns R3F light, mesh, grid, and environment elements.
 */
export default function EnvironmentSetup(): React.ReactElement {
  return (
    <>
      {/* Background colour — dark navy makes painted colours pop (Req 8.7) */}
      <color attach="background" args={['#1a1a2e']} />

      {/* Fog — subtle, matches background, far >= 15 (Requirement 8.5) */}
      <fog attach="fog" args={['#1a1a2e', 8, 18]} />

      {/* Ambient — soft base fill so nothing is fully black */}
      <ambientLight intensity={0.4} />

      {/* Key light — front-right-top, casts shadows (Req 8.1, 8.2) */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Fill light — front-left, softens key-light shadows (Requirement 8.1) */}
      <directionalLight position={[-5, 4, 5]} intensity={0.6} />

      {/* Rim / back light — behind-top, defines silhouette edges (Requirement 8.1) */}
      <directionalLight position={[0, 6, -6]} intensity={0.4} />

      {/* Ground plane — only receives shadows, no colour contribution (Requirement 8.3) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.55, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* Grid floor pattern — spatial reference (Requirement 8.4) */}
      <Grid
        args={[20, 20]}
        position={[0, -0.54, 0]}
        cellSize={1}
        cellColor="#3a3a5e"
        sectionSize={5}
        sectionColor="#5a5a8e"
        fadeDistance={18}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Environment map for PBR reflections (Requirement 8.6) */}
      <Environment preset="city" />
    </>
  );
}
