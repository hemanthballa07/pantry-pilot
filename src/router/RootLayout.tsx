import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastBanner } from '@/components/ToastBanner';
import { RouteFallback } from '@/components/RouteFallback';
import { Overlays } from '@/overlays/Overlays';

// Root layout — no shell chrome. Hosts the ToastBanner and Outlet for all routes.
// The Suspense boundary catches the React.lazy route chunks (Phase 5 route-split
// in router/index.tsx); one boundary here covers Landing *and* every shell route.
// NOTE (workstream 3): once ShellLayout grows a Sidebar/TopBar, add a second
// Suspense *inside* ShellLayout around its Outlet so the chrome stays painted
// while a screen chunk loads, rather than the whole shell flashing the fallback.
export function RootLayout() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
      {/* Overlay host — store-driven drawers/modals that render over any route,
          above the shell chrome's stacking context (Phase 6). */}
      <Overlays />
      <ToastBanner />
    </>
  );
}
