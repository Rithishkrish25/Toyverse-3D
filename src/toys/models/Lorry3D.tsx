import React from 'react';
import PartMesh from '../PartMesh';

/**
 * Procedural 3D Lorry model.
 * Part names match missionData.ts exactly: cab, cargo, wheel-front,
 * wheel-rear, window, bumper.
 */
export default function Lorry3D(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Cargo box */}
      <PartMesh partName="cargo" defaultColor="#CCCCCC" position={[-0.8, 0.6, 0]}>
        <boxGeometry args={[2.0, 1.1, 1.3]} />
      </PartMesh>

      {/* Cab */}
      <PartMesh partName="cab" defaultColor="#CCCCCC" position={[1.15, 0.48, 0]}>
        <boxGeometry args={[0.9, 0.88, 1.3]} />
      </PartMesh>

      {/* Window on cab */}
      <PartMesh partName="window" defaultColor="#CCCCCC" position={[1.62, 0.62, 0]}>
        <boxGeometry args={[0.04, 0.38, 0.95]} />
      </PartMesh>

      {/* Front wheels */}
      <PartMesh partName="wheel-front" defaultColor="#000000" position={[1.1, -0.22, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.26, 16]} />
      </PartMesh>
      <PartMesh partName="wheel-front" defaultColor="#000000" position={[1.1, -0.22, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.26, 16]} />
      </PartMesh>

      {/* Rear wheels */}
      <PartMesh partName="wheel-rear" defaultColor="#000000" position={[-0.9, -0.22, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.26, 16]} />
      </PartMesh>
      <PartMesh partName="wheel-rear" defaultColor="#000000" position={[-0.9, -0.22, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.26, 16]} />
      </PartMesh>

      {/* Bumper */}
      <PartMesh partName="bumper" defaultColor="#808080" position={[1.62, 0.12, 0]}>
        <boxGeometry args={[0.1, 0.16, 1.1]} />
      </PartMesh>
    </group>
  );
}
