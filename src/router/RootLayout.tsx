import { Outlet } from 'react-router-dom';
import { ToastBanner } from '@/components/ToastBanner';

// Root layout — no shell chrome. Hosts the ToastBanner and Outlet for all routes.
// ShellLayout (below) adds Sidebar + TopBar for in-app routes.
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ToastBanner />
    </>
  );
}
