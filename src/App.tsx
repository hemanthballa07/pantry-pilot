import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { router } from '@/router';

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
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
