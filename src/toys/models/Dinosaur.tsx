import React from 'react';
import PartMesh from '../PartMesh';
import type { ToyDefinition } from '../types';

export const DINOSAUR_DEFINITION: ToyDefinition = {
  id: 'dinosaur' as ToyDefinition['id'],
  label: { en: 'Dinosaur', ta: 'டைனோசர்' },
  parts: [
    { name: 'body', defaultColor: '#CCCCCC', label: { en: 'Body', ta: 'உடல்' } },
    { name: 'head', defaultColor: '#CCCCCC', label: { en: 'Head', ta: 'தலை' } },
    { name: 'tail', defaultColor: '#CCCCCC', label: { en: 'Tail', ta: 'வால்' } },
    { name: 'leg-fl', defaultColor: '#CCCCCC', label: { en: 'Front-Left Leg', ta: 'முன்-இடது கால்' } },
    { name: 'leg-fr', defaultColor: '#CCCCCC', label: { en: 'Front-Right Leg', ta: 'முன்-வலது கால்' } },
    { name: 'leg-rl', defaultColor: '#CCCCCC', label: { en: 'Rear-Left Leg', ta: 'பின்-இடது கால்' } },
    { name: 'leg-rr', defaultColor: '#CCCCCC', label: { en: 'Rear-Right Leg', ta: 'பின்-வலது கால்' } },
  ],
};

export default function Dinosaur(): React.ReactElement {
  return (
    <group>
      {/* Body - elongated sphere */}
      <PartMesh partName="body" defaultColor="#CCCCCC" position={[0, 0.8, 0]} scale={[1.5, 0.8, 0.8]}>
        <sphereGeometry args={[0.6, 16, 12]} />
      </PartMesh>
      {/* Head */}
      <PartMesh partName="head" defaultColor="#CCCCCC" position={[0.9, 1.2, 0]} scale={[1.2, 0.9, 0.9]}>
        <sphereGeometry args={[0.35, 16, 12]} />
      </PartMesh>
      {/* Tail - cone pointing back */}
      <PartMesh partName="tail" defaultColor="#CCCCCC" position={[-1.1, 0.8, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.8, 12]} />
      </PartMesh>
      {/* Legs */}
      <PartMesh partName="leg-fl" defaultColor="#CCCCCC" position={[0.5, 0.15, 0.35]}>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 10]} />
      </PartMesh>
      <PartMesh partName="leg-fr" defaultColor="#CCCCCC" position={[0.5, 0.15, -0.35]}>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 10]} />
      </PartMesh>
      <PartMesh partName="leg-rl" defaultColor="#CCCCCC" position={[-0.5, 0.15, 0.35]}>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 10]} />
      </PartMesh>
      <PartMesh partName="leg-rr" defaultColor="#CCCCCC" position={[-0.5, 0.15, -0.35]}>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 10]} />
      </PartMesh>
    </group>
  );
}
