import React from 'react';
import PartMesh from '../PartMesh';

/**
 * Procedural 3D Bicycle — properly connected diamond frame.
 *
 * Junction points (fixed):
 *   RA  = rear axle      (-1.5,  0.0)
 *   FA  = front axle     ( 1.5,  0.0)
 *   BB  = bottom bracket (-0.1,  0.35)
 *   SJ  = seat junction  (-0.5,  1.55)
 *   HTb = head tube bot  ( 1.05, 0.65)
 *   HTt = head tube top  ( 1.15, 1.30)
 *
 * Cylinder rotation formula (Y-axis aligned geometry):
 *   angle = Math.atan2(dx, -dy)  where dx = B.x - A.x, dy = B.y - A.y
 */
export default function Bike3D(): React.ReactElement {
  // ── Junction points ──────────────────────────────────────────────────────
  const RA  = { x: -1.5,  y:  0.0  };
  const FA  = { x:  1.5,  y:  0.0  };
  const BB  = { x: -0.1,  y:  0.35 };
  const SJ  = { x: -0.5,  y:  1.55 };
  const HTb = { x:  1.05, y:  0.65 };
  const HTt = { x:  1.15, y:  1.30 };

  /** Build tube props (midpoint, rotation, length) for a cylinder from A to B. */
  function tube(
    ax: number, ay: number,
    bx: number, by: number
  ): { mx: number; my: number; angle: number; len: number } {
    const dx = bx - ax;
    const dy = by - ay;
    return {
      mx: (ax + bx) / 2,
      my: (ay + by) / 2,
      angle: Math.atan2(dx, -dy),
      len: Math.hypot(dx, dy),
    };
  }

  // ── Frame tubes ──────────────────────────────────────────────────────────
  const chainStay = tube(RA.x, RA.y, BB.x, BB.y);
  const seatStay  = tube(RA.x, RA.y, SJ.x, SJ.y);
  const seatTube  = tube(BB.x, BB.y, SJ.x, SJ.y);
  const downTube  = tube(BB.x, BB.y, HTb.x, HTb.y);
  const topTube   = tube(SJ.x, SJ.y, HTt.x, HTt.y);
  const headTube  = tube(HTb.x, HTb.y, HTt.x, HTt.y);

  // ── Fork tubes ───────────────────────────────────────────────────────────
  const forkL = tube(HTb.x, HTb.y, FA.x, FA.y);
  const forkR = tube(HTb.x, HTb.y, FA.x, FA.y); // same geometry, different z

  return (
    <group position={[0, 0, 0]}>

      {/* ── REAR WHEEL ──────────────────────────────────────────────────── */}
      <PartMesh partName="wheel-rear" defaultColor="#000000"
        position={[RA.x, RA.y, 0]}>
        <torusGeometry args={[0.9, 0.11, 16, 48]} />
      </PartMesh>
      {/* Hub */}
      <PartMesh partName="wheel-rear" defaultColor="#000000"
        position={[RA.x, RA.y, 0]}
        rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.30, 12]} />
      </PartMesh>

      {/* ── FRONT WHEEL ─────────────────────────────────────────────────── */}
      <PartMesh partName="wheel-front" defaultColor="#000000"
        position={[FA.x, FA.y, 0]}>
        <torusGeometry args={[0.9, 0.11, 16, 48]} />
      </PartMesh>
      {/* Hub */}
      <PartMesh partName="wheel-front" defaultColor="#000000"
        position={[FA.x, FA.y, 0]}
        rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.30, 12]} />
      </PartMesh>

      {/* ── FRAME ───────────────────────────────────────────────────────── */}

      {/* Chain stay: RA → BB */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[chainStay.mx, chainStay.my, 0]}
        rotation={[0, 0, chainStay.angle]}>
        <cylinderGeometry args={[0.05, 0.05, chainStay.len, 8]} />
      </PartMesh>

      {/* Seat stay: RA → SJ */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[seatStay.mx, seatStay.my, 0]}
        rotation={[0, 0, seatStay.angle]}>
        <cylinderGeometry args={[0.05, 0.05, seatStay.len, 8]} />
      </PartMesh>

      {/* Seat tube: BB → SJ */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[seatTube.mx, seatTube.my, 0]}
        rotation={[0, 0, seatTube.angle]}>
        <cylinderGeometry args={[0.05, 0.05, seatTube.len, 8]} />
      </PartMesh>

      {/* Down tube: BB → HTb */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[downTube.mx, downTube.my, 0]}
        rotation={[0, 0, downTube.angle]}>
        <cylinderGeometry args={[0.05, 0.05, downTube.len, 8]} />
      </PartMesh>

      {/* Top tube: SJ → HTt */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[topTube.mx, topTube.my, 0]}
        rotation={[0, 0, topTube.angle]}>
        <cylinderGeometry args={[0.05, 0.05, topTube.len, 8]} />
      </PartMesh>

      {/* Head tube: HTb → HTt (slightly thicker) */}
      <PartMesh partName="frame" defaultColor="#CCCCCC"
        position={[headTube.mx, headTube.my, 0]}
        rotation={[0, 0, headTube.angle]}>
        <cylinderGeometry args={[0.07, 0.07, headTube.len, 8]} />
      </PartMesh>

      {/* ── FORKS ───────────────────────────────────────────────────────── */}

      {/* Fork left: HTb → (FA.x, FA.y, +0.12) */}
      <PartMesh partName="handlebar" defaultColor="#808080"
        position={[forkL.mx, forkL.my, 0.06]}
        rotation={[0, 0, forkL.angle]}>
        <cylinderGeometry args={[0.04, 0.04, forkL.len, 8]} />
      </PartMesh>

      {/* Fork right: HTb → (FA.x, FA.y, -0.12) */}
      <PartMesh partName="handlebar" defaultColor="#808080"
        position={[forkR.mx, forkR.my, -0.06]}
        rotation={[0, 0, forkR.angle]}>
        <cylinderGeometry args={[0.04, 0.04, forkR.len, 8]} />
      </PartMesh>

      {/* ── HANDLEBAR ───────────────────────────────────────────────────── */}

      {/* Stem: HTt upward ~0.35 units */}
      <PartMesh partName="handlebar" defaultColor="#808080"
        position={[HTt.x, HTt.y + 0.175, 0]}
        rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
      </PartMesh>

      {/* Crossbar: horizontal at top of stem */}
      <PartMesh partName="handlebar" defaultColor="#808080"
        position={[HTt.x, HTt.y + 0.38, 0]}
        rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.70, 8]} />
      </PartMesh>

      {/* ── SEAT ────────────────────────────────────────────────────────── */}

      {/* Seat post: SJ upward ~0.38 units */}
      <PartMesh partName="seat" defaultColor="#8B4513"
        position={[SJ.x, SJ.y + 0.19, 0]}
        rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.38, 8]} />
      </PartMesh>

      {/* Saddle */}
      <PartMesh partName="seat" defaultColor="#8B4513"
        position={[SJ.x - 0.05, SJ.y + 0.40, 0]}>
        <boxGeometry args={[0.58, 0.07, 0.20]} />
      </PartMesh>

    </group>
  );
}
