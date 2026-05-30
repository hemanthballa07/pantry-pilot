import { createBrowserRouter, useNavigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { ShellLayout } from './ShellLayout';
import Landing from '@/screens/Landing';
import Health from '@/screens/Health';
import Dashboard from '@/screens/Dashboard';
import Pantry from '@/screens/Pantry';
import Shop from '@/screens/Shop';
import { LegacyBridge } from '@/compat/bridge';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: 48, fontFamily: 'var(--font-sans, system-ui)',
      color: 'var(--ink, #1a1814)', background: 'var(--bg, #fafaf7)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 11.5, color: 'var(--ink-muted, #8a8374)', letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase' }}>
        Page not found
      </div>
      <div style={{ fontFamily: 'var(--font-display, Newsreader, serif)', fontSize: 72, letterSpacing: -2, color: 'var(--ink, #1a1814)', lineHeight: 1 }}>
        404
      </div>
      <p style={{ fontSize: 15, color: 'var(--ink-2, #4a4535)', maxWidth: 380, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
        This page doesn't exist. The kitchen is back home.
      </p>
      <button onClick={() => navigate('/')} style={{
        marginTop: 8, padding: '10px 22px', borderRadius: 10,
        fontSize: 14, fontWeight: 600, background: 'var(--ink, #1a1814)',
        color: 'var(--paper-warm, #fdfaf3)', border: 'none', cursor: 'pointer',
      }}>
        ← Home
      </button>
    </div>
  );
}

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
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/pantry',    element: <Pantry /> },
          { path: '/cook',      element: <LegacyBridge screenId="cook" /> },
          { path: '/plan',      element: <LegacyBridge screenId="plan" /> },
          { path: '/shop',      element: <Shop /> },
          { path: '/health',    element: <Health /> },
          { path: '/insights',  element: <LegacyBridge screenId="insights" /> },
          { path: '/household', element: <LegacyBridge screenId="household" /> },
          { path: '/settings',  element: <LegacyBridge screenId="settings" /> },
          { path: '/imports',   element: <LegacyBridge screenId="imports" /> },
        ],
      },
      // Catch-all: replaces React Router's raw dev-mode error boundary for 404s
      { path: '*', element: <NotFound /> },
    ],
  },
]);
