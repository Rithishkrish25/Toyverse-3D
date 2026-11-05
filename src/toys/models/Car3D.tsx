import React from 'react';
import PartMesh from '../PartMesh';

/**
 * Procedural 3D Car model.
 * Part names match missionData.ts exactly: body, roof, wheel-front,
 * wheel-rear, window, bumper.
 */
export default function Car3D(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Body — main chassis */}
      <PartMesh partName="body" defaultColor="#CCCCCC" position={[0, 0.35, 0]}>
        <boxGeometry args={[2.8, 0.55, 1.3]} />
      </PartMesh>

      {/* Roof / cabin */}
      <PartMesh partName="roof" defaultColor="#CCCCCC" position={[0.1, 0.88, 0]}>
        <boxGeometry args={[1.4, 0.48, 1.15]} />
      </PartMesh>

      {/* Windscreen / window */}
      <PartMesh partName="window" defaultColor="#87CEEB" position={[0.72, 0.88, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.04, 0.42, 1.0]} />
      </PartMesh>

      {/* Front wheel */}
      <PartMesh partName="wheel-front" defaultColor="#222222" position={[1.0, 0.0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
      </PartMesh>
      <PartMesh partName="wheel-front" defaultColor="#222222" position={[1.0, 0.0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
      </PartMesh>

      {/* Rear wheel */}
      <PartMesh partName="wheel-rear" defaultColor="#222222" position={[-1.0, 0.0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
      </PartMesh>
      <PartMesh partName="wheel-rear" defaultColor="#222222" position={[-1.0, 0.0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
      </PartMesh>

      {/* Bumper */}
      <PartMesh partName="bumper" defaultColor="#888888" position={[1.45, 0.22, 0]}>
        <boxGeometry args={[0.12, 0.18, 1.1]} />
      </PartMesh>
    </group>
  );
}
