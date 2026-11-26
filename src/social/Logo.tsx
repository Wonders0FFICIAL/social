/** Social logo: a chat bubble holding a list of links. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Social">
      <defs>
        <linearGradient id="sl-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#sl-logo-g)" />
      <path
        fill="#fff"
        d="M24 12H40A12 12 0 0 1 52 24V34A12 12 0 0 1 40 46H33L22 55V46H24A12 12 0 0 1 12 34V24A12 12 0 0 1 24 12Z"
      />
      <rect x="20" y="21" width="24" height="5" rx="2.5" fill="#2563eb" />
      <rect x="20" y="29" width="24" height="5" rx="2.5" fill="#2563eb" opacity=".65" />
      <rect x="20" y="37" width="15" height="5" rx="2.5" fill="#2563eb" opacity=".35" />
    </svg>
  );
}

export default function Logo({ size = 32, word = true }: { size?: number; word?: boolean }) {
  return (
    <span className="sl-logo">
      <LogoMark size={size} />
      {word && (
        <span className="sl-logo-word" style={{ fontSize: size * 0.72 }}>
          social
        </span>
      )}
    </span>
  );
}
