import React from 'react';
import type { ToyDefinition } from '../types';
import PartMesh from '../PartMesh';

export default function Aeroplane(): React.ReactElement {
  return (
    <group>
      <PartMesh partName="fuselage" defaultColor="#CCCCCC" position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 2.5, 16]} />
      </PartMesh>
      <PartMesh partName="wing-left" defaultColor="#CCCCCC" position={[0, 0, 0.8]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.3, 2.0, 0.1]} />
      </PartMesh>
      <PartMesh partName="wing-right" defaultColor="#CCCCCC" position={[0, 0, -0.8]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.3, 2.0, 0.1]} />
      </PartMesh>
      <PartMesh partName="tail-fin" defaultColor="#CCCCCC" position={[-1.0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.1]} />
      </PartMesh>
      <PartMesh partName="engine" defaultColor="#CCCCCC" position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 12]} />
      </PartMesh>
      <PartMesh partName="cockpit" defaultColor="#CCCCCC" position={[0.3, 0.3, 0]}>
        <sphereGeometry args={[0.25, 12, 8]} />
      </PartMesh>
    </group>
  );
}

export const AEROPLANE_DEFINITION: ToyDefinition = {
  id: 'aeroplane' as ToyDefinition['id'],
  label: { en: 'Aeroplane', ta: 'விமானம்' },
  parts: [
    { name: 'fuselage', defaultColor: '#CCCCCC', label: { en: 'Fuselage', ta: 'உடல்' } },
    { name: 'wing-left', defaultColor: '#CCCCCC', label: { en: 'Left Wing', ta: 'இடது இறக்கை' } },
    { name: 'wing-right', defaultColor: '#CCCCCC', label: { en: 'Right Wing', ta: 'வலது இறக்கை' } },
    { name: 'tail-fin', defaultColor: '#CCCCCC', label: { en: 'Tail Fin', ta: 'வால் இறக்கை' } },
    { name: 'engine', defaultColor: '#CCCCCC', label: { en: 'Engine', ta: 'என்ஜின்' } },
    { name: 'cockpit', defaultColor: '#CCCCCC', label: { en: 'Cockpit', ta: 'காக்பிட்' } },
  ],
};
