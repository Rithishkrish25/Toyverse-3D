import React, { Suspense, Component, useEffect } from 'react';
import type { ErrorInfo } from 'react';
import type { ToyId } from './types';
import { TOY_COMPONENTS } from './toyRegistry';

/**
 * Error boundary that catches failures from the lazy-loaded toy component
 * (e.g. a rejected dynamic import or a render error) and renders a red box
 * fallback inside the R3F scene (Requirement 1.6). When `retryKey` changes the
 * boundary resets, allowing the suspended import to be re-attempted.
 */
interface ToyErrorBoundaryProps {
  children: React.ReactNode;
  retryKey: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ToyErrorBoundary extends Component<ToyErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ToyLoader: failed to load toy', error, info);
  }

  componentDidUpdate(prevProps: ToyErrorBoundaryProps): void {
    if (prevProps.retryKey !== this.props.retryKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

export interface ToyLoaderProps {
  /** The toy whose component should be lazy-loaded and rendered. */
  toyId: ToyId;
  /** Fired after the loader mounts. */
  onLoaded?: () => void;
}

/**
 * Dynamically imports and renders the toy component for `toyId`.
 *
 * The lazy component is wrapped in `React.Suspense` (rendering nothing while
 * the chunk loads) and an `ErrorBoundary` so load failures degrade to a red
 * box instead of crashing the scene (Requirement 1.6). The dynamic `import()`
 * lets Vite code-split each toy (Requirement 14.4).
 *
 * `key={toyId}` on the boundary forces a remount whenever the toy changes.
 * The outgoing toy unmounts, letting React Three Fiber dispose of its
 * geometries, materials, and textures (Requirement 14.2).
 *
 * @param toyId - The id of the toy to render.
 * @param onLoaded - Optional callback fired after the loader mounts.
 * @returns The lazy-loaded toy wrapped in Suspense and an ErrorBoundary.
 */
export default function ToyLoader({ toyId, onLoaded }: ToyLoaderProps): React.ReactElement {
  const [retryKey, setRetryKey] = React.useState(0);
  const ToyComponent = TOY_COMPONENTS[toyId];

  useEffect(() => {
    onLoaded?.();
  }, [toyId, onLoaded]);

  return (
    <ToyErrorBoundary retryKey={retryKey} key={toyId}>
      <Suspense fallback={null}>
        <ToyComponent />
      </Suspense>
    </ToyErrorBoundary>
  );
}
