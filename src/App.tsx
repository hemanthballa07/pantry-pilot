import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      style={{
        padding: 24,
        fontFamily: 'var(--font-sans, system-ui)',
        color: 'var(--tomato, crimson)',
      }}
    >
      <strong>Something broke:</strong> {error.message}
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <main
        style={{
          padding: 24,
          fontFamily: 'var(--font-sans, system-ui)',
          color: 'var(--ink, #1f1f1f)',
          background: 'var(--bg, #fafaf7)',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-display, Newsreader, serif)' }}>
          Pantry Pilot
        </h1>
        <p>Phase 1 scaffold — Vite + React 18 + TypeScript.</p>
      </main>
    </ErrorBoundary>
  );
}
