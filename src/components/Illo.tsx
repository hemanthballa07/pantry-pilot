// Shared food illustration tile. The production app renders illustrations as
// soft rounded color swatches (the detailed prototype SVGs were not ported);
// Cook and Landing each carry an inline copy of this same primitive — this is
// the shared home for the overlay layer. Color map lifted verbatim from
// Cook.tsx so the overlay matches the shipped recipe cards.
const ILLO_COLORS: Record<string, string> = {
  rice: '#E8D9A8',
  bread: '#D4A853',
  chicken: '#C9884A',
  carrot: '#E07840',
  beans: '#8B6040',
  frozenveg: '#7ABFA8',
  berries: '#8E4A8E',
  chili: '#C93A3A',
  banana: '#E8C840',
  milk: '#F0EAD6',
  tofu: '#F0EDD8',
  oats: '#C8A878',
  oil: '#C8B860',
  coffee: '#6B4226',
  salt: '#E8E8E0',
  pasta: '#E8CF88',
  cheese: '#E8B840',
  ricebag: '#D4C090',
  peanutbutter: '#C8904A',
  soy: '#8B7340',
  onion: '#C8A8C8',
  garlic: '#E8D8C0',
  tomato: '#C83A3A',
  pepper: '#3A9848',
  spinach: '#3B6E3D',
  egg: '#C99325',
  yogurt: '#E8DCC8',
  apple: '#C73E2E',
  noodles: '#E0C070',
  tortilla: '#E8C88A',
  paneer: '#F0EAD6',
  lentils: '#C97A3A',
};

interface IlloProps {
  name: string;
  size?: number;
}

export function Illo({ name, size = 48 }: IlloProps) {
  const bg = ILLO_COLORS[name] ?? 'var(--line, rgba(0,0,0,.1))';
  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: bg,
        opacity: 0.82,
        flexShrink: 0,
      }}
    />
  );
}
