import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { scrollToId } from "../App";

const ANCHORS = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Build Timeline" },
  { id: "anatomy", label: "Hardware Anatomy" },
  { id: "lab", label: "PID Lab" },
  { id: "competition", label: "Competition" },
  { id: "poster", label: "Poster" },
  { id: "team", label: "Team" },
];

export default function Navbar() {
  const [active, setActive] = useState("overview");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    ANCHORS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-edge/70" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <button
          data-testid="nav-brand-button"
          onClick={() => go("overview")}
          className="flex items-center gap-3"
        >
          <Logo />
          <span className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-mint/30 bg-mint/5 px-3 py-1 2xl:flex">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
            <span className="font-mono text-[9.5px] tracking-[0.18em] text-mint">
              UCSD ECE 5 | AUTONOMOUS MOBILE ROBOTICS
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {ANCHORS.map(({ id, label }) => (
            <button
              key={id}
              data-testid={`nav-link-${id}`}
              onClick={() => go(id)}
              className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
                active === id ? "bg-white/[0.06] text-cyan" : "text-mute hover:text-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            data-testid="nav-github-link"
            href="https://github.com/pitchfork650/BIGHERO6IX"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-edge bg-surface/80 px-4 py-2 text-[13px] font-semibold text-cream transition-all duration-300 hover:border-cyan/50 hover:glow-cyan sm:flex"
          >
            <Github size={15} />
            GitHub Repo
          </a>
          <button
            data-testid="nav-mobile-toggle"
            className="rounded-lg border border-edge p-2 text-cream lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass border-t border-edge px-5 pb-6 pt-2 lg:hidden">
          {ANCHORS.map(({ id, label }) => (
            <button
              key={id}
              data-testid={`nav-mobile-link-${id}`}
              onClick={() => go(id)}
              className={`block w-full rounded-lg px-3 py-3 text-left text-sm font-medium ${
                active === id ? "text-cyan" : "text-mute"
              }`}
            >
              {label}
            </button>
          ))}
          <a
            href="https://github.com/pitchfork650/BIGHERO6IX"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-full border border-edge px-4 py-3 text-sm font-semibold text-cream"
          >
            <Github size={15} /> GitHub Repo
          </a>
        </div>
      )}
    </header>
  );
}
