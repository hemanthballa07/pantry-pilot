// Shared route table for the e2e suites. Imported by both the functional smoke
// (routes.spec.ts, uses `label`) and the visual-regression suite (routes.vrt.ts,
// uses `name`) so adding/removing a route updates both at once — no silent drift
// where a new route is functionally covered but missing a visual baseline.
export const ROUTES = [
  { path: '/', name: 'landing', label: 'Landing' },
  { path: '/dashboard', name: 'dashboard', label: 'Dashboard' },
  { path: '/pantry', name: 'pantry', label: 'Pantry' },
  { path: '/cook', name: 'cook', label: 'Cook' },
  { path: '/plan', name: 'plan', label: 'Plan' },
  { path: '/shop', name: 'shop', label: 'Shop' },
  { path: '/health', name: 'health', label: 'Health' },
  { path: '/insights', name: 'insights', label: 'Insights' },
  { path: '/household', name: 'household', label: 'Household' },
  { path: '/settings', name: 'settings', label: 'Settings' },
  { path: '/imports', name: 'imports', label: 'Imports' },
] as const;
