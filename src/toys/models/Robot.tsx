import React from 'react';
import PartMesh from '../PartMesh';
import type { ToyDefinition } from '../types';

export const ROBOT_DEFINITION: ToyDefinition = {
  id: 'robot' as ToyDefinition['id'],
  label: { en: 'Robot', ta: 'ரோபோ' },
  parts: [
    { name: 'head', defaultColor: '#CCCCCC', label: { en: 'Head', ta: 'தலை' } },
    { name: 'torso', defaultColor: '#CCCCCC', label: { en: 'Torso', ta: 'உடல்' } },
    { name: 'arm-left', defaultColor: '#CCCCCC', label: { en: 'Left Arm', ta: 'இடது கை' } },
    { name: 'arm-right', defaultColor: '#CCCCCC', label: { en: 'Right Arm', ta: 'வலது கை' } },
    { name: 'leg-left', defaultColor: '#CCCCCC', label: { en: 'Left Leg', ta: 'இடது கால்' } },
    { name: 'leg-right', defaultColor: '#CCCCCC', label: { en: 'Right Leg', ta: 'வலது கால்' } },
  ],
};

export default function Robot(): React.ReactElement {
  return (
    <group>
      {/* Head */}
      <PartMesh partName="head" defaultColor="#CCCCCC" position={[0, 1.6, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
      </PartMesh>
      {/* Torso */}
      <PartMesh partName="torso" defaultColor="#CCCCCC" position={[0, 0.8, 0]}>
        <boxGeometry args={[0.9, 1.0, 0.5]} />
      </PartMesh>
      {/* Arms */}
      <PartMesh partName="arm-left" defaultColor="#CCCCCC" position={[0.65, 0.8, 0]} rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 12]} />
      </PartMesh>
      <PartMesh partName="arm-right" defaultColor="#CCCCCC" position={[-0.65, 0.8, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 12]} />
      </PartMesh>
      {/* Legs */}
      <PartMesh partName="leg-left" defaultColor="#CCCCCC" position={[0.25, 0.0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 12]} />
      </PartMesh>
      <PartMesh partName="leg-right" defaultColor="#CCCCCC" position={[-0.25, 0.0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 12]} />
      </PartMesh>
    </group>
  );
}
