// Shared inline screen Icon (single-path, strokeWidth 1.8). Backed by the union
// of the four screen ICON_PATHS maps (Pantry/Shop/Plan/Cook) — 36 keys, no
// conflicting glyphs. Distinct from the shell icon set in src/components/Icon.tsx.

const ICON_PATHS: Record<string, string> = {
  alert:
    'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  arrowDown: 'M12 5v14M5 12l7 7 7-7',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  bag: 'M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M9 7a3 3 0 1 1 6 0',
  barcode: 'M3 5v14M6 5v14M9.5 5v14M12 5v14M15 5v14M18.5 5v14M21 5v14',
  camera:
    'M3 8a2 2 0 012-2h2l1.2-2h7.6L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z M12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  calendar:
    'M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z M3 11h18 M8 3v4 M16 3v4',
  cart: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0',
  check: 'M20 6L9 17l-5-5',
  checkCircle: 'M12 21a9 9 0 110-18 9 9 0 010 18z M8.5 12l2.5 2.5 4.5-5',
  chef: 'M6 13a6 6 0 0112 0v3H6v-3zM9 16v2a3 3 0 006 0v-2',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 18l6-6-6-6',
  chevronUp: 'M6 15l6-6 6 6',
  circle: 'M12 3a9 9 0 1 0 0 18 a9 9 0 1 0 0-18z',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18z M12 7v5l3 2',
  close: 'M6 6l12 12M18 6L6 18',
  drag: 'M7.8 6a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M13.8 6a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M7.8 12a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M13.8 12a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M7.8 18a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M13.8 18a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0',
  edit: 'M14 4l6 6L9 21H3v-6z',
  fire: 'M12 2c0 4 5 5 5 11a5 5 0 0 1-10 0c0-1 1-3 2-4-1 4 3 4 3 4-2-3 0-7 0-11z',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5s-2-3-2-3 4 0 6-2z',
  fridge:
    'M6 2h12a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z M5 10h14 M8 6v1 M8 13v3',
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  heart: 'M12 21s-7-4.5-9-9c-1.5-3 1-7 5-7 2 0 3 1 4 2 1-1 2-2 4-2 4 0 6.5 4 5 7-2 4.5-9 9-9 9z',
  house: 'M3 21V11l9-7 9 7v10 M9 21v-6h6v6',
  info: 'M12 21a9 9 0 110-18 9 9 0 010 18z M12 16v-4 M12 8h.01',
  knife: 'M3 20l16-16 2 2L5 22z M14 9l4 4',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 22 8 22 12 21 14 18c2-3 0-7-3-7s-5 3-3 7',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  pantry:
    'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z M3 9h18 M3 15h18 M9 3v18 M15 3v18',
  plus: 'M12 5v14M5 12h14',
  receipt: 'M6 2h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3V2z M9 7h6 M9 11h6 M9 15h4',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
  scan: 'M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2',
  snowflake: 'M12 2v20 M2 12h20 M5 5l14 14 M19 5L5 19',
  sparkles:
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
  timer: 'M12 6a8 8 0 110 16 8 8 0 010-16z M10 2h4 M12 10v4',
  trash:
    'M3 6h18 M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M10 11v6 M14 11v6',
  upload: 'M12 16V4M5 11l7-7 7 7 M3 20h18',
  users:
    'M5.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0 M2 20a7 7 0 0 1 14 0 M14.5 7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M16 14a5 5 0 0 1 6 5',
  wallet:
    'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm14 5a1 1 0 110-2 1 1 0 010 2z',
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: string;
  /** Decorative by default (aria-hidden) — every instance sits beside a text
   *  label, so the icon adds no information for a screen reader. Pass
   *  `decorative={false}` to opt out for a meaningful standalone icon (none today). */
  decorative?: boolean;
}

export function Icon({ name, size = 18, stroke = 'currentColor', decorative = true }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden={decorative || undefined}
    >
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}
