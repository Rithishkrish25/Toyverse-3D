import React from 'react';
import type { ToyDefinition } from '../types';
import PartMesh from '../PartMesh';

/**
 * Procedural Rocket 3D model with 6 independently paintable parts.
 * @returns A group of PartMesh components forming a rocket.
 */
export default function Rocket(): React.ReactElement {
  return (
    <group>
      <PartMesh partName="fuselage" defaultColor="#CCCCCC" position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2.0, 16]} />
      </PartMesh>
      <PartMesh partName="nose" defaultColor="#CCCCCC" position={[0, 1.5, 0]}>
        <coneGeometry args={[0.5, 1.0, 16]} />
      </PartMesh>
      <PartMesh partName="fin-left" defaultColor="#CCCCCC" position={[-0.6, -0.6, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.5, 0.8, 0.1]} />
      </PartMesh>
      <PartMesh partName="fin-right" defaultColor="#CCCCCC" position={[0.6, -0.6, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.5, 0.8, 0.1]} />
      </PartMesh>
      <PartMesh partName="engine" defaultColor="#CCCCCC" position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.4, 12]} />
      </PartMesh>
      <PartMesh partName="window" defaultColor="#CCCCCC" position={[0, 0.3, 0.45]}>
        <sphereGeometry args={[0.2, 12, 8]} />
      </PartMesh>
    </group>
  );
}

export const ROCKET_DEFINITION: ToyDefinition = {
  id: 'rocket' as ToyDefinition['id'],
  label: { en: 'Rocket', ta: 'ராக்கெட்' },
  parts: [
    { name: 'fuselage', defaultColor: '#CCCCCC', label: { en: 'Fuselage', ta: 'உடல்' } },
    { name: 'nose', defaultColor: '#CCCCCC', label: { en: 'Nose Cone', ta: 'மூக்கு' } },
    { name: 'fin-left', defaultColor: '#CCCCCC', label: { en: 'Left Fin', ta: 'இடது இறக்கை' } },
    { name: 'fin-right', defaultColor: '#CCCCCC', label: { en: 'Right Fin', ta: 'வலது இறக்கை' } },
    { name: 'engine', defaultColor: '#CCCCCC', label: { en: 'Engine', ta: 'என்ஜின்' } },
    { name: 'window', defaultColor: '#CCCCCC', label: { en: 'Window', ta: 'ஜன்னல்' } },
  ],
};
