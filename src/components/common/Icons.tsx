export function DumbbellIcon({ color = '#F4F4F2' }: { color?: string }) {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true">
      <rect x="0" y="2" width="3" height="8" fill={color} />
      <rect x="4" y="4" width="2" height="4" fill={color} />
      <rect x="6" y="5" width="10" height="2" fill={color} />
      <rect x="16" y="4" width="2" height="4" fill={color} />
      <rect x="19" y="2" width="3" height="8" fill={color} />
    </svg>
  );
}

export function PlayGlyph({ size = 11 }: { size?: number }) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>▶</span>;
}
