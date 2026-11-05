import React from 'react';
import AppRouter from './ui/router/AppRouter';

/**
 * Root application component.
 * Renders the AppRouter which handles all client-side routing.
 *
 * @returns The root application element with routing.
 */
export default function App(): React.ReactElement {
  return <AppRouter />;
}
