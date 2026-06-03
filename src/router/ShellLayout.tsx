import { useState, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { RouteFallback } from '@/components/RouteFallback';
import { useNavStore, useSearchStore, useToastStore } from '@/stores';

// App shell chrome (WS3) — ported from the prototype src/shell.jsx. Sidebar nav
// + TopBar (title, search, action buttons) around the routed screens.

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  urgent?: number;
  badge?: number;
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Today', icon: 'home' },
  { id: 'pantry', label: 'Pantry', icon: 'pantry', urgent: 4 },
  { id: 'cook', label: 'Cook', icon: 'chef' },
  { id: 'plan', label: 'Plan', icon: 'calendar' },
  { id: 'shop', label: 'Shop', icon: 'cart', badge: 11 },
  { id: 'health', label: 'Health', icon: 'heart' },
  { id: 'imports', label: 'Quick add', icon: 'scan' },
  { id: 'insights', label: 'Insights', icon: 'chart' },
  { id: 'household', label: 'Household', icon: 'users' },
];

const TITLES: Record<string, string> = {
  dashboard: 'Today',
  pantry: 'Pantry',
  cook: 'Cook',
  plan: 'Plan',
  shop: 'Shop',
  health: 'Health',
  imports: 'Quick add',
  insights: 'Insights',
  household: 'Household',
  settings: 'Settings',
};

function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(150deg, var(--green) 0%, var(--green-deep) 100%)',
        display: 'grid',
        placeItems: 'center',
        flex: '0 0 auto',
        boxShadow: '0 1px 0 rgba(255,255,255,.2) inset, 0 2px 6px rgba(60,50,30,.18)',
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 21C5 21 3 16 3 12c0-6 7-10 17-9 1 10-4 18-9 18z"
          stroke="#FDFAF3"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M3 21c4-6 9-10 16-12" stroke="#FDFAF3" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="16" cy="8" r="1.4" fill="#F0C95A" />
      </svg>
    </div>
  );
}

function Sidebar({
  active,
  onNav,
  collapsed,
  onToggle,
}: {
  active: string;
  onNav: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      aria-label="Sidebar"
      style={{
        width: collapsed ? 64 : 232,
        flex: '0 0 auto',
        background: 'var(--paper-warm)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 240ms cubic-bezier(.2,.8,.2,1)',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? '20px 12px' : '22px 18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <Logo size={28} />
        {!collapsed && (
          <div>
            <div
              className="serif"
              style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1, letterSpacing: -0.3 }}
            >
              PantryPilot
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--ink-muted)',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: 3,
              }}
            >
              Kitchen OS
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" style={{ flex: 1, overflowY: 'auto', padding: '14px 8px' }}>
        {NAV.map((n) => {
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={collapsed ? n.label : undefined}
              title={collapsed ? n.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'var(--paper)' : 'transparent',
                color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                boxShadow: isActive ? 'var(--sh-1)' : 'none',
                position: 'relative',
                marginBottom: 3,
                transition: 'background 160ms, color 160ms',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: -8,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    background: 'var(--green)',
                    borderRadius: 999,
                  }}
                />
              )}
              <Icon name={n.icon} size={18} stroke={isActive ? 'var(--green)' : 'currentColor'} />
              {!collapsed && <span style={{ flex: 1 }}>{n.label}</span>}
              {!collapsed && n.urgent && (
                <span
                  style={{
                    background: 'var(--tomato)',
                    color: '#FDFAF3',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {n.urgent}
                </span>
              )}
              {!collapsed && n.badge && !n.urgent && (
                <span style={{ color: 'var(--ink-soft)', fontSize: 11.5, fontWeight: 600 }}>
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div style={{ padding: collapsed ? 10 : 14, borderTop: '1px solid var(--line-soft)' }}>
        {collapsed ? (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <Avatar initials="HB" color="var(--green)" size={32} />
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: 'var(--bg-tint)',
              borderRadius: 12,
              border: '1px solid var(--line)',
            }}
          >
            <Avatar initials="HB" color="var(--green)" size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Hemanth</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                Apartment 4B · 3 members
              </div>
            </div>
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-muted)',
                padding: 4,
                cursor: 'pointer',
              }}
            >
              <Icon name="chevronLeft" size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function IconBtn({
  onClick,
  icon,
  label,
  badge,
  badgeDot,
}: {
  onClick: () => void;
  icon: IconName;
  label: string;
  badge?: number;
  badgeDot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        color: 'var(--ink-muted)',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={16} />
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--tomato)',
            color: '#FDFAF3',
            borderRadius: 999,
            padding: '0 5px',
            fontSize: 9.5,
            fontWeight: 700,
            lineHeight: '14px',
            minWidth: 14,
            textAlign: 'center',
            border: '2px solid var(--bg)',
          }}
        >
          {badge}
        </span>
      )}
      {badgeDot && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: 999,
            background: 'var(--tomato)',
            border: '2px solid var(--paper)',
          }}
        />
      )}
    </button>
  );
}

function TopBar({ title }: { title: string }) {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const openAddItem = useNavStore((s) => s.openAddItem);
  const openInbox = useNavStore((s) => s.openInbox);
  const openAskPilot = useNavStore((s) => s.openAskPilot);
  const pushToast = useToastStore((s) => s.push);
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250, 246, 238, 0.85)',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        borderBottom: '1px solid var(--line)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          className="serif"
          style={{ margin: 0, fontSize: 22, color: 'var(--ink)', letterSpacing: -0.3 }}
        >
          {title}
        </h1>
      </div>

      {/* Search — writes the shared search store (Cook/Pantry read it). */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 300,
          height: 36,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '0 12px',
          color: 'var(--ink-muted)',
        }}
      >
        <Icon name="search" size={15} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or ask in plain English…"
          aria-label="Search"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13,
            color: 'var(--ink)',
            fontFamily: 'inherit',
          }}
        />
        {/* Visual affordance only — the ⌘K focus shortcut is not wired yet. */}
        <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
          ⌘K
        </span>
      </div>

      <IconBtn onClick={openAddItem} icon="plus" label="Add item" />
      <IconBtn onClick={openInbox} icon="bookmark" label="Kitchen Inbox" badge={5} />
      <IconBtn
        onClick={() => pushToast('Theme switching arrives in a later update')}
        icon="moon"
        label="Toggle theme"
      />
      <IconBtn onClick={openAskPilot} icon="bell" label="Notifications" badgeDot />
      <IconBtn onClick={() => navigate('/settings')} icon="settings" label="Settings" />

      <button
        onClick={openAskPilot}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          height: 36,
          padding: '0 14px',
          borderRadius: 10,
          background: 'var(--ink)',
          border: '1px solid var(--ink)',
          color: 'var(--paper-warm)',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ color: 'var(--amber)' }}>
          <Icon name="sparkles" size={14} />
        </span>
        Ask Pilot
      </button>
    </header>
  );
}

// The inner <Suspense> keeps the chrome painted while a lazy screen chunk loads
// (the outer boundary in RootLayout covers the full-page Landing route).
export function ShellLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const clearSearch = useSearchStore((s) => s.clear);

  const active = pathname.replace(/^\//, '');
  const title = TITLES[active] ?? 'PantryPilot';

  // Reset search when changing screens so a query typed on one screen doesn't
  // silently filter the next (code review WS3).
  const go = (id: string) => {
    clearSearch();
    navigate('/' + id);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        active={active}
        onNav={go}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={title} />
        <main style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
