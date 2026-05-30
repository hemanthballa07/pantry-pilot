import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { ShellLayout } from './ShellLayout';
import Landing from '@/screens/Landing';
import { LegacyBridge } from '@/compat/bridge';

// A2 nested router: Landing lives outside the shell (matches src/app.jsx:99-109
// where landing renders without <Sidebar>/<TopBar>). All in-app screens sit
// under ShellLayout. Each unconverted screen routes through LegacyBridge (D1).
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Full-page routes — no shell chrome
      { path: '/', element: <Landing /> },

      // Shell routes — Sidebar + TopBar added in Phase 4
      {
        element: <ShellLayout />,
        children: [
          { path: '/dashboard', element: <LegacyBridge screenId="dashboard" /> },
          { path: '/pantry',    element: <LegacyBridge screenId="pantry" /> },
          { path: '/cook',      element: <LegacyBridge screenId="cook" /> },
          { path: '/plan',      element: <LegacyBridge screenId="plan" /> },
          { path: '/shop',      element: <LegacyBridge screenId="shop" /> },
          { path: '/health',    element: <LegacyBridge screenId="health" /> },
          { path: '/insights',  element: <LegacyBridge screenId="insights" /> },
          { path: '/household', element: <LegacyBridge screenId="household" /> },
          { path: '/settings',  element: <LegacyBridge screenId="settings" /> },
          { path: '/imports',   element: <LegacyBridge screenId="imports" /> },
        ],
      },
    ],
  },
]);
