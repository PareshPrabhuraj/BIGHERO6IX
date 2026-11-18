const ITEMS = [
  "7-CHANNEL OPTOELECTRONIC SENSING",
  "REAL-TIME ANALOG PID",
  "240 MHZ DUAL-CORE XTENSA",
  "4 MM GROUND CLEARANCE",
  "DIFFERENTIAL DRIVE ACTUATION",
  "MAKING · BREAKING · HACKING STUFF",
  "TEAM BIG HERO 6IX",
];

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-edge/70 bg-surface/40 py-5">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex items-center">
            {ITEMS.map((item) => (
              <span key={`${copy}-${item}`} className="flex items-center">
                <span className="whitespace-nowrap px-8 font-mono text-[11px] font-semibold tracking-[0.3em] text-mute">
                  {item}
                </span>
                <span className="h-1 w-1 rotate-45 bg-cyan/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-carbon to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-carbon to-transparent" />
    </div>
  );
}
