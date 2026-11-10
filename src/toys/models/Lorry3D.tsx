import React from 'react';
import PartMesh from '../PartMesh';

/**
 * Procedural 3D Lorry model — premium geometry.
 * Part names match missionData.ts: cab, cargo, wheel-front, wheel-rear, window, bumper.
 */
export default function Lorry3D(): React.ReactElement {
  return (
    <group position={[0, 0.08, 0]}>

      {/* CARGO BOX */}
      <PartMesh partName="cargo" defaultColor="#CCCCCC"
        position={[-0.8, 0.6, 0]}
        roughness={0.5} metalness={0.05} castShadow>
        <boxGeometry args={[2.0, 1.1, 1.3]} />
      </PartMesh>

      {/* Cargo roof strip */}
      <PartMesh partName="cargo" defaultColor="#BBBBBB"
        position={[-0.8, 1.17, 0]}
        roughness={0.4} metalness={0.1} castShadow>
        <boxGeometry args={[2.0, 0.07, 1.3]} />
      </PartMesh>

      {/* Cargo panel line ridges */}
      {[-0.6, 0.0, 0.6].map((x) => (
        <PartMesh key={`ridge-${x}`} partName="cargo" defaultColor="#BBBBBB"
          position={[-0.8 + x, 0.6, 0.66]} roughness={0.5} metalness={0.05}>
          <boxGeometry args={[0.055, 1.1, 0.04]} />
        </PartMesh>
      ))}

      {/* CAB */}
      <PartMesh partName="cab" defaultColor="#CCCCCC"
        position={[1.15, 0.48, 0]} roughness={0.3} metalness={0.15} castShadow>
        <roundedBoxGeometry args={[0.9, 0.88, 1.3, 4, 0.08]} />
      </PartMesh>

      {/* Cab roof fairing */}
      <PartMesh partName="cab" defaultColor="#CCCCCC"
        position={[0.75, 1.0, 0]} roughness={0.3} metalness={0.1} castShadow>
        <roundedBoxGeometry args={[0.75, 0.22, 1.28, 4, 0.06]} />
      </PartMesh>

      {/* Exhaust stack */}
      <PartMesh partName="cab" defaultColor="#808080"
        position={[0.75, 1.15, -0.45]} roughness={0.3} metalness={0.4} castShadow>
        <cylinderGeometry args={[0.055, 0.045, 0.55, 10]} />
      </PartMesh>

      {/* Exhaust cap */}
      <PartMesh partName="cab" defaultColor="#666666"
        position={[0.75, 1.44, -0.45]} roughness={0.3} metalness={0.6}>
        <cylinderGeometry args={[0.07, 0.055, 0.06, 10]} />
      </PartMesh>

      {/* WINDOW */}
      <PartMesh partName="window" defaultColor="#87CEEB"
        position={[1.62, 0.62, 0]} transparent opacity={0.5} roughness={0.1} metalness={0.05}>
        <boxGeometry args={[0.04, 0.38, 0.95]} />
      </PartMesh>

      {/* FRONT WHEELS */}
      <PartMesh partName="wheel-front" defaultColor="#111111"
        position={[1.1, -0.22, 0.75]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      <PartMesh partName="wheel-front" defaultColor="#999999"
        position={[1.1, -0.22, 0.75]} rotation={[Math.PI / 2, 0, 0]} metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>
      <PartMesh partName="wheel-front" defaultColor="#111111"
        position={[1.1, -0.22, -0.75]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      <PartMesh partName="wheel-front" defaultColor="#999999"
        position={[1.1, -0.22, -0.75]} rotation={[Math.PI / 2, 0, 0]} metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>

      {/* REAR WHEELS */}
      <PartMesh partName="wheel-rear" defaultColor="#111111"
        position={[-0.9, -0.22, 0.75]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      <PartMesh partName="wheel-rear" defaultColor="#999999"
        position={[-0.9, -0.22, 0.75]} rotation={[Math.PI / 2, 0, 0]} metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>
      <PartMesh partName="wheel-rear" defaultColor="#111111"
        position={[-0.9, -0.22, -0.75]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      <PartMesh partName="wheel-rear" defaultColor="#999999"
        position={[-0.9, -0.22, -0.75]} rotation={[Math.PI / 2, 0, 0]} metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>

      {/* BUMPER */}
      <PartMesh partName="bumper" defaultColor="#808080"
        position={[1.63, 0.12, 0]} metalness={0.55} roughness={0.28}>
        <roundedBoxGeometry args={[0.08, 0.16, 1.18, 4, 0.03]} />
      </PartMesh>

      {/* Rear lights — decorative, share bumper partName */}
      <PartMesh partName="bumper" defaultColor="#FF2200"
        position={[-1.82, 0.52, 0.52]} roughness={0.3} metalness={0.4}>
        <boxGeometry args={[0.04, 0.14, 0.09]} />
      </PartMesh>
      <PartMesh partName="bumper" defaultColor="#FF2200"
        position={[-1.82, 0.52, -0.52]} roughness={0.3} metalness={0.4}>
        <boxGeometry args={[0.04, 0.14, 0.09]} />
      </PartMesh>

      {/* Front lights */}
      <PartMesh partName="bumper" defaultColor="#FFFFCC"
        position={[1.64, 0.52, 0.42]} roughness={0.1} metalness={0.3}
        transparent opacity={0.9}>
        <boxGeometry args={[0.04, 0.12, 0.14]} />
      </PartMesh>
      <PartMesh partName="bumper" defaultColor="#FFFFCC"
        position={[1.64, 0.52, -0.42]} roughness={0.1} metalness={0.3}
        transparent opacity={0.9}>
        <boxGeometry args={[0.04, 0.12, 0.14]} />
      </PartMesh>

    </group>
  );
}
