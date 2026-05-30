import { Outlet } from 'react-router-dom';

// Shell layout — wraps in-app screens (dashboard, pantry, cook, …).
// Phase 4 will add <Sidebar> + <TopBar> here once those components are
// converted from src/shell.jsx. The Outlet currently renders LegacyBridge
// placeholders that display the legacy prototype screens in Phase 4.
export function ShellLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #fafaf7)' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
  );
}
