import { RoundedBoxGeometry } from 'three-stdlib';
import type { Object3DNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    roundedBoxGeometry: Object3DNode<RoundedBoxGeometry, typeof RoundedBoxGeometry>;
  }
}
