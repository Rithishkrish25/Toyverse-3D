import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const HomeScreen = lazy(() => import('../screens/HomeScreen'));
const PaintingScreen = lazy(() => import('../screens/PaintingScreen'));
const DashboardScreen = lazy(() => import('../screens/DashboardScreen'));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen'));

/**
 * Root client-side router for the TOYVERSE application.
 * Defines four named routes: Home, Painting, Dashboard, Settings.
 * Unknown routes redirect to Home with a "page not found" message (Req 13.4).
 *
 * @returns The BrowserRouter with all application routes.
 */
export default function AppRouter(): React.ReactElement {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading">Loading…</div>}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/paint/:toyId" element={<PaintingScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace state={{ notFound: true }} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
