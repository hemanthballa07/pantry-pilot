// Vitest setup: register jest-dom matchers (toBeInTheDocument, etc.) and clean
// up the rendered DOM after each test. Referenced by vitest.config.ts setupFiles.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
