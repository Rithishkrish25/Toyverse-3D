import React, { useRef, useEffect, useCallback } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/**
 * Camera controller with OrbitControls, zoom clamping, ground-plane polar clamp,
 * and auto-rotation that resumes after 5 s of pointer inactivity.
 *
 * @returns Drei OrbitControls element.
 */
export default function CameraController(): React.ReactElement {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoRotatingRef = useRef(false);
  const { gl } = useThree();

  const AUTO_ROTATE_SPEED = (10 / 360) * 2 * Math.PI; // 10 deg/s in rad/s
  const IDLE_TIMEOUT_MS = 5000;

  const stopAutoRotate = useCallback(() => {
    isAutoRotatingRef.current = false;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  }, []);

  const scheduleAutoRotate = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isAutoRotatingRef.current = true;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
      }
    }, IDLE_TIMEOUT_MS);
  }, []);

  const handleInteraction = useCallback(() => {
    stopAutoRotate();
    scheduleAutoRotate();
  }, [stopAutoRotate, scheduleAutoRotate]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handleInteraction);
    canvas.addEventListener('pointermove', handleInteraction);
    canvas.addEventListener('wheel', handleInteraction);
    canvas.addEventListener('touchstart', handleInteraction);
    canvas.addEventListener('touchmove', handleInteraction);

    scheduleAutoRotate();

    return () => {
      canvas.removeEventListener('pointerdown', handleInteraction);
      canvas.removeEventListener('pointermove', handleInteraction);
      canvas.removeEventListener('wheel', handleInteraction);
      canvas.removeEventListener('touchstart', handleInteraction);
      canvas.removeEventListener('touchmove', handleInteraction);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [gl.domElement, handleInteraction, scheduleAutoRotate]);

  useFrame((_, delta) => {
    if (controlsRef.current && isAutoRotatingRef.current) {
      controlsRef.current.autoRotateSpeed = AUTO_ROTATE_SPEED * delta * 60;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={1}
      maxDistance={10}
      maxPolarAngle={Math.PI / 2}
      enableDamping
      dampingFactor={0.05}
      autoRotate={false}
      makeDefault
    />
  );
}
