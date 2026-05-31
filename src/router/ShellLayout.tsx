import { Outlet } from 'react-router-dom';

// Shell layout — wraps in-app screens (dashboard, pantry, cook, …).
// All Phase 4 screens are now native TSX (the LegacyBridge was removed when the
// last screens converted). Phase 5 will add <Sidebar> + <TopBar> here once those
// components are converted from src/shell.jsx.
export function ShellLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #fafaf7)' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
  );
}
