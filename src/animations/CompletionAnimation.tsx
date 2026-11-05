import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Confetti from './Confetti';

interface CompletionAnimationProps {
  /** Called when the animation finishes or is skipped. */
  onComplete: () => void;
}

/**
 * Completion celebration animation. Renders confetti particles inside its own
 * R3F Canvas (so useFrame is correctly scoped) and auto-completes after 3 s.
 * Shows a Skip button immediately.
 *
 * The component is intentionally self-contained so it can be mounted as a
 * plain React overlay anywhere in the component tree without requiring a
 * parent Canvas context (Requirement 10).
 *
 * @param onComplete - Callback when animation ends or is skipped.
 * @returns The animation overlay with confetti canvas and skip button.
 */
export default function CompletionAnimation({ onComplete }: CompletionAnimationProps): React.ReactElement {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    if (!done) {
      setDone(true);
      onComplete();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        pointerEvents: 'none',
      }}
    >
      {/* Confetti canvas — fills the overlay, pointer-events off so painting
          controls below remain reachable if needed */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Confetti />
        </Suspense>
      </Canvas>

      {/* Skip button — pointer-events re-enabled just for this element */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          pointerEvents: 'auto',
        }}
      >
        <button
          className="btn"
          onClick={handleSkip}
          style={{
            padding: '10px 24px',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          Skip ⏭
        </button>
      </div>
    </div>
  );
}
