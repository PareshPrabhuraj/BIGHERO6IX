import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const CHALLENGES = [
  {
    id: "1A",
    title: "4-Potentiometer Real-Time Tuning Deck",
    body: "Mapped to ESP32-S3 pins IO1 (Kd), IO2 (Ki), IO3 (Kp), and IO4 (Speed). Allows on-the-fly gain calibration without recompilation — twist a knob, watch the loop respond in milliseconds.",
    chips: ["IO1 · Kd", "IO2 · Ki", "IO3 · Kp", "IO4 · Speed"],
  },
  {
    id: "1B",
    title: "7-Photoresistor Reflectance Sensor Bar",
    body: "Built with 10k Ohm voltage dividers. Height optimized to 4 mm for an 800% signal contrast boost (3400 ADC on black tape vs 420 ADC on white floor).",
    chips: ["10 kΩ dividers", "4 mm clearance", "3400 vs 420 ADC", "+800% contrast"],
  },
  {
    id: "1C",
    title: "L298N Dual H-Bridge Motor Driver",
    body: "PWM on IO8/IO13 and direction logic on IO9–IO12. Features strict power isolation between the 9V motor pack and ESP32 logic rail.",
    chips: ["PWM IO8/IO13", "DIR IO9–IO12", "Isolated 9V rails"],
  },
  {
    id: "1D",
    title: "Onshape CAD Chassis Re-Engineering",
    body: "Custom 3D-printed black PLA ambient light shroud (eliminating fluorescent glare) and rigid cantilever sensor comb.",
    chips: ["Black PLA", "Ambient light shroud", "Cantilever comb"],
  },
  {
    id: "2",
    title: "Systems Integration & Wire Harnessing",
    body: "Hot-glue strain relief on motor brass tabs, vibration-damped breadboard sleds, and front caster balance.",
    chips: ["Strain relief", "Damped sleds", "Caster balance"],
  },
];

const ease = [0.16, 1, 0.3, 1];

export default function Timeline() {
  const [active, setActive] = useState(0);
  const c = CHALLENGES[active];

  return (
    <section id="timeline" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="SUBSYSTEM PROTOTYPING"
          title="Build Timeline — Challenge 1A to 2"
          sub="Five sequential engineering challenges took Big Hero 6ix from a bare ESP32-S3 to a competition-locked autonomous platform."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* rail */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {CHALLENGES.map((ch, i) => (
              <button
                key={ch.id}
                data-testid={`timeline-step-${ch.id}`}
                onClick={() => setActive(i)}
                className={`group relative flex min-w-[230px] items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 lg:min-w-0 ${
                  active === i
                    ? "border-cyan/40 bg-surface glow-cyan"
                    : "border-edge bg-surface/50 hover:border-cyan/25"
                }`}
              >
                <span
                  className={`font-mono text-sm font-bold ${active === i ? "text-cyan" : "text-mute"}`}
                >
                  {ch.id}
                </span>
                <span
                  className={`flex-1 text-[13px] font-semibold leading-snug ${
                    active === i ? "text-cream" : "text-mute group-hover:text-cream"
                  }`}
                >
                  {ch.title}
                </span>
                <ChevronRight
                  size={14}
                  className={`shrink-0 transition-opacity ${active === i ? "text-cyan opacity-100" : "opacity-0"}`}
                />
                {active === i && (
                  <motion.span
                    layoutId="timeline-rail"
                    className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-cyan"
                  />
                )}
              </button>
            ))}
          </div>

          {/* detail panel */}
          <div className="card-surface grain relative min-h-[320px] overflow-hidden rounded-3xl p-8 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease }}
                data-testid={`timeline-panel-${c.id}`}
              >
                <span className="pointer-events-none absolute -right-4 -top-10 select-none text-[11rem] font-black leading-none text-white/[0.035] sm:text-[15rem]">
                  {c.id}
                </span>
                <p className="font-mono text-[10px] tracking-[0.3em] text-mint">
                  CHALLENGE {c.id} — STEP {active + 1} OF {CHALLENGES.length}
                </p>
                <h3 className="mt-5 max-w-xl text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                  {c.title}
                </h3>
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mute">{c.body}</p>
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {c.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-edge bg-carbon/60 px-4 py-2 font-mono text-[11px] tracking-wider text-cyan"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
