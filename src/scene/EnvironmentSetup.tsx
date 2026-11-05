import React from 'react';

/**
 * Sets up the ambient and directional lighting for the Workshop scene.
 * Ensures no Part surface renders as fully unlit (Requirement 2.3).
 *
 * @returns R3F light elements.
 */
export default function EnvironmentSetup(): React.ReactElement {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <color attach="background" args={['#1a1a2e']} />
    </>
  );
}
