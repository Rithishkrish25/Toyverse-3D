import React from 'react';
import PartMesh from '../PartMesh';

/**
 * Procedural 3D Bicycle — premium diamond frame.
 * Part names match missionData.ts: frame, wheel-front, wheel-rear, handlebar, seat.
 */
export default function Bike3D(): React.ReactElement {
  // Junction points
  const RA  = { x: -1.5,  y:  0.0  };
  const FA  = { x:  1.5,  y:  0.0  };
  const BB  = { x: -0.1,  y:  0.35 };
  const SJ  = { x: -0.5,  y:  1.55 };
  const HTb = { x:  1.05, y:  0.65 };
  const HTt = { x:  1.15, y:  1.30 };

  function tube(ax: number, ay: number, bx: number, by: number) {
    const dx = bx - ax;
    const dy = by - ay;
    return { mx: (ax + bx) / 2, my: (ay + by) / 2, angle: Math.atan2(dx, -dy), len: Math.hypot(dx, dy) };
  }

  const chainStay = tube(RA.x, RA.y, BB.x, BB.y);
  const seatStay  = tube(RA.x, RA.y, SJ.x, SJ.y);
  const seatTube  = tube(BB.x, BB.y, SJ.x, SJ.y);
  const downTube  = tube(BB.x, BB.y, HTb.x, HTb.y);
  const topTube   = tube(SJ.x, SJ.y, HTt.x, HTt.y);
  const headTube  = tube(HTb.x, HTb.y, HTt.x, HTt.y);
  const forkL     = tube(HTb.x, HTb.y, FA.x, FA.y);
  const forkR     = tube(HTb.x, HTb.y, FA.x, FA.y);

  function spoke(angle: number, wx: number, wy: number, innerR: number, outerR: number) {
    const sx = wx + innerR * Math.cos(angle);
    const sy = wy + innerR * Math.sin(angle);
    const ex = wx + outerR * Math.cos(angle);
    const ey = wy + outerR * Math.sin(angle);
    const dx = ex - sx; const dy = ey - sy;
    return { mx: (sx + ex) / 2, my: (sy + ey) / 2, rot: Math.atan2(dx, -dy), len: Math.hypot(dx, dy) };
  }

  const SPOKE_COUNT = 8;
  const spokeAngles = Array.from({ length: SPOKE_COUNT }, (_, i) => (i / SPOKE_COUNT) * Math.PI * 2);
  const rearSpokes  = spokeAngles.map((a) => spoke(a, RA.x, RA.y, 0.2, 0.72));
  const frontSpokes = spokeAngles.map((a) => spoke(a, FA.x, FA.y, 0.2, 0.72));

  return (
    <group position={[0, 0.08, 0]}>

      {/* REAR WHEEL */}
      <PartMesh partName="wheel-rear" defaultColor="#111111"
        position={[RA.x, RA.y, 0]} metalness={0.0} roughness={0.85} castShadow>
        <torusGeometry args={[0.9, 0.12, 18, 52]} />
      </PartMesh>
      <PartMesh partName="wheel-rear" defaultColor="#999999"
        position={[RA.x, RA.y, 0]} rotation={[Math.PI / 2, 0, 0]} metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.18, 18]} />
      </PartMesh>
      {rearSpokes.map((s, i) => (
        <PartMesh key={`rs-${i}`} partName="wheel-rear" defaultColor="#999999"
          position={[s.mx, s.my, 0]} rotation={[0, 0, s.rot]} metalness={0.5} roughness={0.3}>
          <cylinderGeometry args={[0.011, 0.011, s.len, 4]} />
        </PartMesh>
      ))}

      {/* FRONT WHEEL */}
      <PartMesh partName="wheel-front" defaultColor="#111111"
        position={[FA.x, FA.y, 0]} metalness={0.0} roughness={0.85} castShadow>
        <torusGeometry args={[0.9, 0.12, 18, 52]} />
      </PartMesh>
      <PartMesh partName="wheel-front" defaultColor="#999999"
        position={[FA.x, FA.y, 0]} rotation={[Math.PI / 2, 0, 0]} metalness={0.6} roughness={0.25}>
        <cylinderGeometry args={[0.21, 0.21, 0.18, 18]} />
      </PartMesh>
      {frontSpokes.map((s, i) => (
        <PartMesh key={`fs-${i}`} partName="wheel-front" defaultColor="#999999"
          position={[s.mx, s.my, 0]} rotation={[0, 0, s.rot]} metalness={0.5} roughness={0.3}>
          <cylinderGeometry args={[0.011, 0.011, s.len, 4]} />
        </PartMesh>
      ))}

      {/* FRAME */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[chainStay.mx, chainStay.my, 0]} rotation={[0, 0, chainStay.angle]}
        roughness={0.3} metalness={0.2} castShadow>
        <cylinderGeometry args={[0.055, 0.055, chainStay.len, 10]} />
      </PartMesh>
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[seatStay.mx, seatStay.my, 0]} rotation={[0, 0, seatStay.angle]}
        roughness={0.3} metalness={0.2} castShadow>
        <cylinderGeometry args={[0.05, 0.05, seatStay.len, 10]} />
      </PartMesh>
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[seatTube.mx, seatTube.my, 0]} rotation={[0, 0, seatTube.angle]}
        roughness={0.3} metalness={0.2} castShadow>
        <cylinderGeometry args={[0.055, 0.055, seatTube.len, 10]} />
      </PartMesh>
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[downTube.mx, downTube.my, 0]} rotation={[0, 0, downTube.angle]}
        roughness={0.3} metalness={0.2} castShadow>
        <cylinderGeometry args={[0.058, 0.058, downTube.len, 10]} />
      </PartMesh>
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[topTube.mx, topTube.my, 0]} rotation={[0, 0, topTube.angle]}
        roughness={0.3} metalness={0.2} castShadow>
        <cylinderGeometry args={[0.05, 0.05, topTube.len, 10]} />
      </PartMesh>
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[headTube.mx, headTube.my, 0]} rotation={[0, 0, headTube.angle]}
        roughness={0.3} metalness={0.2} castShadow>
        <cylinderGeometry args={[0.08, 0.08, headTube.len, 10]} />
      </PartMesh>

      {/* Chain */}
      <PartMesh partName="frame" defaultColor="#444444"
        position={[chainStay.mx, chainStay.my - 0.015, 0.045]} rotation={[0, 0, chainStay.angle]}
        roughness={0.6} metalness={0.4}>
        <cylinderGeometry args={[0.018, 0.018, chainStay.len, 6]} />
      </PartMesh>

      {/* FORKS */}
      <PartMesh partName="handlebar" defaultColor="#888888"
        position={[forkL.mx, forkL.my, 0.07]} rotation={[0, 0, forkL.angle]}
        metalness={0.55} roughness={0.3} castShadow>
        <cylinderGeometry args={[0.04, 0.035, forkL.len, 10]} />
      </PartMesh>
      <PartMesh partName="handlebar" defaultColor="#888888"
        position={[forkR.mx, forkR.my, -0.07]} rotation={[0, 0, forkR.angle]}
        metalness={0.55} roughness={0.3} castShadow>
        <cylinderGeometry args={[0.04, 0.035, forkR.len, 10]} />
      </PartMesh>

      {/* HANDLEBAR */}
      <PartMesh partName="handlebar" defaultColor="#888888"
        position={[HTt.x, HTt.y + 0.175, 0]} rotation={[0, 0, 0]}
        metalness={0.55} roughness={0.3} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 10]} />
      </PartMesh>
      <PartMesh partName="handlebar" defaultColor="#888888"
        position={[HTt.x, HTt.y + 0.38, 0]} rotation={[0, Math.PI / 2, 0]}
        metalness={0.55} roughness={0.3} castShadow>
        <torusGeometry args={[0.36, 0.028, 10, 28, Math.PI]} />
      </PartMesh>

      {/* SEAT */}
      <PartMesh partName="seat" defaultColor="#888888"
        position={[SJ.x, SJ.y + 0.19, 0]} rotation={[0, 0, 0]}
        metalness={0.4} roughness={0.4} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.38, 10]} />
      </PartMesh>
      {/* Saddle */}
      <PartMesh partName="seat" defaultColor="#2a2a2a"
        position={[SJ.x - 0.05, SJ.y + 0.40, 0]} scale={[0.62, 0.11, 0.24]}
        roughness={0.85} metalness={0.0} castShadow>
        <sphereGeometry args={[1, 20, 10]} />
      </PartMesh>
      {/* Saddle rails */}
      <PartMesh partName="seat" defaultColor="#888888"
        position={[SJ.x - 0.05, SJ.y + 0.36, 0.08]} roughness={0.4} metalness={0.5}>
        <cylinderGeometry args={[0.008, 0.008, 0.52, 6]} />
      </PartMesh>
      <PartMesh partName="seat" defaultColor="#888888"
        position={[SJ.x - 0.05, SJ.y + 0.36, -0.08]} roughness={0.4} metalness={0.5}>
        <cylinderGeometry args={[0.008, 0.008, 0.52, 6]} />
      </PartMesh>
      {/* Pedals */}
      <PartMesh partName="seat" defaultColor="#333333"
        position={[BB.x, BB.y, 0.22]} roughness={0.7} metalness={0.2}>
        <boxGeometry args={[0.18, 0.04, 0.07]} />
      </PartMesh>
      <PartMesh partName="seat" defaultColor="#333333"
        position={[BB.x, BB.y, -0.22]} roughness={0.7} metalness={0.2}>
        <boxGeometry args={[0.18, 0.04, 0.07]} />
      </PartMesh>

    </group>
  );
}
