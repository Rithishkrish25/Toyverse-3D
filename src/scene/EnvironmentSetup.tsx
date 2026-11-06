import React from 'react';

/**
 * Sets up 3-point lighting for the Workshop scene and a subtle shadow-receiving
 * ground plane. Provides key/fill/rim lights for depth and realism.
 *
 * Ensures no Part surface renders as fully unlit (Requirement 2.3).
 *
 * @returns R3F light and mesh elements.
 */
export default function EnvironmentSetup(): React.ReactElement {
  return (
    <>
      {/* Background colour — dark navy makes painted colours pop */}
      <color attach="background" args={['#1a1a2e']} />

      {/* Ambient — soft base fill so nothing is fully black */}
      <ambientLight intensity={0.5} />

      {/* Key light — front-right-top, strong, casts shadows */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Fill light — front-left, no shadow, softens key-light shadows */}
      <directionalLight position={[-5, 4, 5]} intensity={0.6} />

      {/* Rim / back light — behind-top, defines silhouette edges */}
      <directionalLight position={[0, 6, -6]} intensity={0.4} />

      {/* Ground plane — only receives shadows (no colour contribution) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.55, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </>
  );
}
