// Suspense fallback shown while a lazily-loaded route chunk downloads.
// Phase 5 (workstream 1): screens are code-split via React.lazy in
// src/router/index.tsx, so each route resolves its own chunk — this is the
// brief loading state in between. Uses only existing styles.css tokens
// (no new tokens, no styles.css edits). The spinner animates via inline SVG
// SMIL so it needs no CSS keyframe of its own.
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: 'var(--bg, #fafaf7)',
        color: 'var(--ink-muted, #8a8374)',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="var(--line, #e7e2d6)" strokeWidth="2.5" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="var(--ink, #1a1814)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <div style={{ fontSize: 12.5, letterSpacing: 0.4, fontWeight: 600 }}>Loading…</div>
    </div>
  );
}
