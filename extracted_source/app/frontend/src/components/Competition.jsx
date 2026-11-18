import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Upload } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import { scrollToId } from "../App";

const TRACKS = [
  {
    id: "drag",
    name: "Track 1: Drag Race",
    speed: 85, kp: 18, ki: 2, kd: 24,
    metric: "Official Run Time",
    outcome: "4.82 s",
    rank: "Rank 2nd in class",
    rankTone: "cyan",
    rationale: "Low Kp prevents divergent high-speed over-correction, while heavy Kd dampens high-speed wobble.",
  },
  {
    id: "sweep",
    name: "Track 2: Frequency Sweep",
    speed: 48, kp: 46, ki: 4, kd: 32,
    metric: "Course Completion",
    outcome: "100%",
    rank: "Rank 1st in class",
    rankTone: "mint",
    rationale: "Reduced forward speed maximizes available cornering friction, while aggressive Kp snaps into rapid alternating S-bends and high Kd prevents overshooting.",
  },
  {
    id: "loop",
    name: "Track 3: Continuous Loop",
    speed: 62, kp: 30, ki: 12, kd: 18,
    metric: "Loop Count",
    outcome: "14 loops",
    rank: "Rank 1st in class",
    rankTone: "mint",
    rationale: "Tuned Ki counters steady-state drift toward the outer rail on constant-radius curves, sustaining loop after loop without operator touch.",
  },
];

const ease = [0.16, 1, 0.3, 1];

export default function Competition() {
  const [active, setActive] = useState(0);
  const t = TRACKS[active];

  const loadTune = () => {
    window.dispatchEvent(
      new CustomEvent("bh6:load-tune", { detail: { name: t.name, speed: t.speed, kp: t.kp, ki: t.ki, kd: t.kd } })
    );
    scrollToId("lab");
  };

  return (
    <section id="competition" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="TRACK ADAPTATION MATRIX"
          title="Competition Scorecard"
          sub="Three disciplines, three bespoke tuning matrices. Every rank was earned on the official course."
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {TRACKS.map((tr, i) => (
            <button
              key={tr.id}
              data-testid={`competition-tab-${tr.id}`}
              onClick={() => setActive(i)}
              className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                active === i ? "border-cyan/45 bg-surface glow-cyan" : "border-edge bg-surface/50 hover:border-cyan/25"
              }`}
            >
              <p className="font-mono text-[10px] tracking-[0.25em] text-mute">TRACK {i + 1}</p>
              <p className={`mt-2 text-[15px] font-bold ${active === i ? "text-cyan" : "text-cream"}`}>{tr.name.split(": ")[1]}</p>
              <p className="mt-1 font-mono text-[10.5px] text-mute">{tr.metric}</p>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease }}
            data-testid={`competition-panel-${t.id}`}
            className="card-surface mt-5 overflow-hidden rounded-3xl"
          >
            <div className="grid lg:grid-cols-[1fr_1.1fr]">
              <div className="border-b border-edge p-8 sm:p-10 lg:border-b-0 lg:border-r">
                <p className="font-mono text-[10px] tracking-[0.3em] text-cyan">TUNING MATRIX</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ["BASE SPEED", t.speed],
                    ["KP", t.kp],
                    ["KI", t.ki],
                    ["KD", t.kd],
                  ].map(([k, v]) => (
                    <div key={k} data-testid={`tune-${k.toLowerCase()}-value`} className="rounded-2xl border border-edge bg-carbon/60 p-4">
                      <p className="font-mono text-[9px] tracking-[0.22em] text-mute">{k}</p>
                      <p className="mt-1.5 font-mono text-2xl font-bold text-cyan">{v}</p>
                    </div>
                  ))}
                </div>
                <button
                  data-testid="competition-load-tune"
                  onClick={loadTune}
                  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-cyan px-5 py-3.5 text-[13px] font-bold text-carbon transition-all duration-300 hover:glow-cyan hover:brightness-110"
                >
                  <Upload size={14} />
                  Load This Tune Into the Simulator
                </button>
              </div>

              <div className="p-8 sm:p-10">
                <p className="font-mono text-[10px] tracking-[0.3em] text-mute">OFFICIAL OUTCOME</p>
                <div className="mt-5 flex flex-wrap items-end gap-5">
                  <p data-testid="competition-outcome" className="text-5xl font-extrabold tracking-tight text-cream sm:text-6xl">
                    {t.outcome}
                  </p>
                  <span
                    className={`mb-2 flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-wider ${
                      t.rankTone === "mint" ? "border-mint/40 bg-mint/10 text-mint" : "border-cyan/40 bg-cyan/10 text-cyan"
                    }`}
                  >
                    <Trophy size={12} />
                    {t.rank}
                  </span>
                </div>
                <div className="mt-7 rounded-2xl border border-edge bg-carbon/60 p-5">
                  <p className="font-mono text-[9px] tracking-[0.22em] text-mute">ENGINEERING RATIONALE</p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-cream/90">{t.rationale}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
