// src/screens/Extras.tsx — barrel after the OQ-004 / ADR-004 split.
//
// The four routed screens that used to live here are now their own modules under
// src/screens/extras/* (sharing src/screens/extras/shared.tsx). This re-export preserves
// the legacy `@/screens/Extras` import path — `src/overlays/Capture.integration.test.tsx`
// still imports `{ Imports }` from here. The router imports the screen modules directly
// (see src/router/index.tsx) so each route keeps its own lazy chunk.
export { Insights } from './extras/Insights';
export { Household } from './extras/Household';
export { Imports } from './extras/Imports';
export { Settings } from './extras/Settings';
