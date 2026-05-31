// Initials avatar used in the shell user card (ported from the prototype's PPUI).
export function Avatar({
  initials,
  color = 'var(--green)',
  size = 32,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#FDFAF3',
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        flex: '0 0 auto',
        letterSpacing: 0.2,
      }}
    >
      {initials}
    </div>
  );
}
