// Vitest setup: register jest-dom matchers (toBeInTheDocument, etc.) and clean
// up the rendered DOM after each test. Referenced by vitest.config.ts setupFiles.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// Raise RTL's async-util (findBy*/waitFor) timeout from its 1000ms default. The
// heavy overlay integration suites resolve a React.lazy chunk before the asserted
// element appears; under CPU contention (a concurrent Docker/amd64 VRT run) that
// can exceed 1000ms and false-fail. 5000ms is well under vitest's 15000ms test
// ceiling, so a genuinely stuck test still fails fast. Pairs with the
// poolOptions/testTimeout bounds in vitest.config.ts.
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});
