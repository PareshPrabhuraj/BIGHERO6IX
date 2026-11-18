import { Github, Mail } from "lucide-react";
import Logo from "./Logo";
import { scrollToId } from "../App";

const CONTACTS = [
  { label: "pprabhuraj@ucsd.edu", href: "mailto:pprabhuraj@ucsd.edu", tid: "footer-email-paresh" },
  { label: "ece5-circuit@ucsd.edu", href: "mailto:ece5-circuit@ucsd.edu", tid: "footer-email-2" },
  { label: "ece5-cad@ucsd.edu", href: "mailto:ece5-cad@ucsd.edu", tid: "footer-email-3" },
  { label: "ece5-systems@ucsd.edu", href: "mailto:ece5-systems@ucsd.edu", tid: "footer-email-4" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-edge/70 bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-mute">
              An autonomous optoelectronic line-following robot — designed, machined, tuned
              and raced in one quarter for UC San Diego ECE 5.
            </p>
            <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-wider text-mute">
              UC SAN DIEGO JACOBS SCHOOL OF ENGINEERING
              <br />
              ECE 5: MAKING, BREAKING, HACKING STUFF · FALL QUARTER 2026
              <br />
              PROF. KARCHER MORRIS
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-mint">CONTACT</p>
              <ul className="mt-5 space-y-3">
                {CONTACTS.map((c) => (
                  <li key={c.tid}>
                    <a href={c.href} data-testid={c.tid} className="flex items-center gap-2.5 text-[13px] text-mute transition-colors hover:text-cyan">
                      <Mail size={13} />
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-mint">PROJECT</p>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href="https://github.com/pitchfork650/BIGHERO6IX" target="_blank" rel="noreferrer" data-testid="footer-github" className="flex items-center gap-2.5 text-[13px] text-mute transition-colors hover:text-cyan">
                    <Github size={13} />
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="/poster.pdf" download data-testid="footer-documentation" className="flex items-center gap-2.5 text-[13px] text-mute transition-colors hover:text-cyan">
                    <Mail size={13} />
                    Project Documentation (PDF)
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollToId("lab")} data-testid="footer-lab-link" className="flex items-center gap-2.5 text-[13px] text-mute transition-colors hover:text-cyan">
                    <Mail size={13} />
                    PID Simulation Lab
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-edge/60 pt-8 sm:flex-row">
          <p className="font-mono text-[10.5px] tracking-wider text-mute">© 2026 TEAM BIG HERO 6IX</p>
          <p className="font-mono text-[10.5px] tracking-wider text-mute">
            <span className="text-mint">●</span> SYSTEM NOMINAL — ALL RAILS POWERED
          </p>
        </div>
      </div>
    </footer>
  );
}
