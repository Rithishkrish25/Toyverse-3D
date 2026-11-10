import React from 'react';
import PartMesh from '../PartMesh';

/**
 * Procedural 3D Car model — premium geometry.
 * Part names match missionData.ts exactly: body, roof, wheel-front,
 * wheel-rear, window, bumper.
 */
export default function Car3D(): React.ReactElement {
  return (
    <group position={[0, 0.08, 0]}>

      {/* ── CHASSIS / BODY ── */}
      <PartMesh
        partName="body"
        defaultColor="#CCCCCC"
        position={[0, 0.35, 0]}
        roughness={0.3}
        metalness={0.15}
        castShadow
      >
        <roundedBoxGeometry args={[2.8, 0.55, 1.3, 4, 0.08]} />
      </PartMesh>

      {/* Hood — bonnet/cabin visual separation */}
      <PartMesh
        partName="body"
        defaultColor="#CCCCCC"
        position={[0.85, 0.63, 0]}
        roughness={0.3}
        metalness={0.15}
        castShadow
      >
        <roundedBoxGeometry args={[1.05, 0.12, 1.25, 4, 0.05]} />
      </PartMesh>

      {/* Boot / rear deck */}
      <PartMesh
        partName="body"
        defaultColor="#CCCCCC"
        position={[-0.85, 0.63, 0]}
        roughness={0.3}
        metalness={0.15}
        castShadow
      >
        <roundedBoxGeometry args={[1.0, 0.1, 1.25, 4, 0.05]} />
      </PartMesh>

      {/* ── ROOF / CABIN ── */}
      <PartMesh
        partName="roof"
        defaultColor="#CCCCCC"
        position={[0.1, 0.88, 0]}
        roughness={0.4}
        metalness={0.1}
        castShadow
      >
        <roundedBoxGeometry args={[1.4, 0.48, 1.15, 4, 0.06]} />
      </PartMesh>

      {/* ── WINDOWS ── */}
      {/* Front windscreen */}
      <PartMesh
        partName="window"
        defaultColor="#87CEEB"
        position={[0.72, 0.90, 0]}
        rotation={[0, 0, 0.42]}
        transparent
        opacity={0.5}
        roughness={0.1}
        metalness={0.05}
      >
        <boxGeometry args={[0.08, 0.40, 1.05]} />
      </PartMesh>

      {/* Rear windscreen */}
      <PartMesh
        partName="window"
        defaultColor="#87CEEB"
        position={[-0.72, 0.90, 0]}
        rotation={[0, 0, -0.42]}
        transparent
        opacity={0.5}
        roughness={0.1}
        metalness={0.05}
      >
        <boxGeometry args={[0.08, 0.38, 1.05]} />
      </PartMesh>

      {/* Left side window */}
      <PartMesh
        partName="window"
        defaultColor="#87CEEB"
        position={[0.1, 0.92, 0.585]}
        transparent
        opacity={0.45}
        roughness={0.1}
        metalness={0.05}
      >
        <boxGeometry args={[1.05, 0.30, 0.03]} />
      </PartMesh>

      {/* Right side window */}
      <PartMesh
        partName="window"
        defaultColor="#87CEEB"
        position={[0.1, 0.92, -0.585]}
        transparent
        opacity={0.45}
        roughness={0.1}
        metalness={0.05}
      >
        <boxGeometry args={[1.05, 0.30, 0.03]} />
      </PartMesh>

      {/* ── FRONT WHEELS — tire + rim ── */}
      {/* Front-left tire */}
      <PartMesh partName="wheel-front" defaultColor="#111111"
        position={[1.0, 0.0, 0.72]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      {/* Front-left rim */}
      <PartMesh partName="wheel-front" defaultColor="#888888"
        position={[1.0, 0.0, 0.72]} rotation={[Math.PI / 2, 0, 0]}
        metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>

      {/* Front-right tire */}
      <PartMesh partName="wheel-front" defaultColor="#111111"
        position={[1.0, 0.0, -0.72]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      {/* Front-right rim */}
      <PartMesh partName="wheel-front" defaultColor="#888888"
        position={[1.0, 0.0, -0.72]} rotation={[Math.PI / 2, 0, 0]}
        metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>

      {/* ── REAR WHEELS — tire + rim ── */}
      {/* Rear-left tire */}
      <PartMesh partName="wheel-rear" defaultColor="#111111"
        position={[-1.0, 0.0, 0.72]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      {/* Rear-left rim */}
      <PartMesh partName="wheel-rear" defaultColor="#888888"
        position={[-1.0, 0.0, 0.72]} rotation={[Math.PI / 2, 0, 0]}
        metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>

      {/* Rear-right tire */}
      <PartMesh partName="wheel-rear" defaultColor="#111111"
        position={[-1.0, 0.0, -0.72]} roughness={0.85} metalness={0.0} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 36]} />
      </PartMesh>
      {/* Rear-right rim */}
      <PartMesh partName="wheel-rear" defaultColor="#888888"
        position={[-1.0, 0.0, -0.72]} rotation={[Math.PI / 2, 0, 0]}
        metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 16]} />
      </PartMesh>

      {/* ── BUMPERS ── */}
      {/* Front bumper */}
      <PartMesh partName="bumper" defaultColor="#808080"
        position={[1.46, 0.22, 0]}
        metalness={0.55} roughness={0.28}>
        <roundedBoxGeometry args={[0.10, 0.18, 1.18, 4, 0.03]} />
      </PartMesh>

      {/* Rear bumper */}
      <PartMesh partName="bumper" defaultColor="#808080"
        position={[-1.46, 0.22, 0]}
        metalness={0.55} roughness={0.28}>
        <roundedBoxGeometry args={[0.10, 0.18, 1.18, 4, 0.03]} />
      </PartMesh>

      {/* Front grille strip */}
      <PartMesh partName="bumper" defaultColor="#555555"
        position={[1.42, 0.38, 0]}
        metalness={0.7} roughness={0.2}>
        <boxGeometry args={[0.08, 0.1, 1.0]} />
      </PartMesh>

    </group>
  );
}
