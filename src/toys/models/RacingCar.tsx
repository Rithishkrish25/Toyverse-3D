import React from 'react';
import type { ToyDefinition } from '../types';
import PartMesh from '../PartMesh';

/**
 * Procedural Racing Car 3D model with 6 independently paintable parts.
 * @returns A group of PartMesh components forming a racing car.
 */
export default function RacingCar(): React.ReactElement {
  return (
    <group>
      {/* Body */}
      <PartMesh partName="body" defaultColor="#CCCCCC" position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 0.6, 1.4]} />
      </PartMesh>
      {/* Cabin */}
      <PartMesh partName="cabin" defaultColor="#CCCCCC" position={[0.2, 1.0, 0]}>
        <boxGeometry args={[1.5, 0.5, 1.2]} />
      </PartMesh>
      {/* Wheels */}
      <PartMesh partName="wheel-fl" defaultColor="#CCCCCC" position={[1.0, 0.2, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
      </PartMesh>
      <PartMesh partName="wheel-fr" defaultColor="#CCCCCC" position={[1.0, 0.2, -0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
      </PartMesh>
      <PartMesh partName="wheel-rl" defaultColor="#CCCCCC" position={[-1.0, 0.2, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
      </PartMesh>
      <PartMesh partName="wheel-rr" defaultColor="#CCCCCC" position={[-1.0, 0.2, -0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
      </PartMesh>
    </group>
  );
}

/**
 * ToyDefinition manifest for the Racing Car.
 */
export const RACING_CAR_DEFINITION: ToyDefinition = {
  id: 'racing-car' as ToyDefinition['id'],
  label: { en: 'Racing Car', ta: 'பந்தய கார்' },
  parts: [
    { name: 'body', defaultColor: '#CCCCCC', label: { en: 'Body', ta: 'உடல்' } },
    { name: 'cabin', defaultColor: '#CCCCCC', label: { en: 'Cabin', ta: 'கேபின்' } },
    { name: 'wheel-fl', defaultColor: '#CCCCCC', label: { en: 'Front Left Wheel', ta: 'முன் இடது சக்கரம்' } },
    { name: 'wheel-fr', defaultColor: '#CCCCCC', label: { en: 'Front Right Wheel', ta: 'முன் வலது சக்கரம்' } },
    { name: 'wheel-rl', defaultColor: '#CCCCCC', label: { en: 'Rear Left Wheel', ta: 'பின் இடது சக்கரம்' } },
    { name: 'wheel-rr', defaultColor: '#CCCCCC', label: { en: 'Rear Right Wheel', ta: 'பின் வலது சக்கரம்' } },
  ],
};
