export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bh6g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00F0FF" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#0D0E12" stroke="url(#bh6g)" strokeWidth="2.5" />
      <path d="M18 40 L26 24 L32 36 L38 24 L46 40" stroke="url(#bh6g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="48" r="2.4" fill="#00F0FF" />
      <circle cx="23" cy="48" r="2.4" fill="#00F0FF" opacity="0.85" />
      <circle cx="31" cy="48" r="2.4" fill="#00F0FF" opacity="0.7" />
      <circle cx="39" cy="48" r="2.4" fill="#10B981" opacity="0.85" />
      <circle cx="47" cy="48" r="2.4" fill="#10B981" />
    </svg>
  );
}

export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <span className="font-mono text-sm font-bold tracking-[0.22em] text-cream">
          BIG&nbsp;HERO&nbsp;<span className="text-cyan">6IX</span>
        </span>
      )}
    </span>
  );
}
