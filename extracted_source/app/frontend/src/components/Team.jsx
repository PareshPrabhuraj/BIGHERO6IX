import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import SectionHeading from "./SectionHeading";

const TEAM = [
  {
    name: "Paresh Prabhu Raj",
    role: "Team Lead & Embedded Firmware Architect",
    meta: "ECE Class of 2030",
    email: "pprabhuraj@ucsd.edu",
    pid: "A19386710",
    bio: "Embedded C++ firmware, discrete PID algorithm implementation, real-time telemetry, and electrical power isolation.",
    initials: "PP",
    tid: "team-paresh",
  },
  {
    name: "Teammate 2 (Circuit Lead)",
    role: "Circuit & Sensor Hardware Lead",
    meta: "ECE 5 · Fall Quarter 2026",
    email: "ece5-circuit@ucsd.edu",
    bio: "7-LDR optical reflectance voltage divider array, 4-potentiometer control bank wiring, and continuity testing.",
    initials: "T2",
    tid: "teammate-2",
  },
  {
    name: "Teammate 3 (Mechanical Lead)",
    role: "CAD Mechanical & 3D Printing Lead",
    meta: "ECE 5 · Fall Quarter 2026",
    email: "ece5-cad@ucsd.edu",
    bio: "Onshape CAD chassis modifications: custom 3D-printed black PLA ambient light shroud and rigid sensor comb.",
    initials: "T3",
    tid: "teammate-3",
  },
  {
    name: "Teammate 4 (Systems Lead)",
    role: "Systems & Web Lead",
    meta: "ECE 5 · Fall Quarter 2026",
    email: "ece5-systems@ucsd.edu",
    bio: "Competition heat logging, video documentation, and 2×3 academic poster compilation.",
    initials: "T4",
    tid: "teammate-4",
  },
];

const RETROSPECTIVE = [
  "Over the final week of development, we significantly improved robot stability by designing a 3D-printed ambient light shroud that eliminated sensor saturation from overhead laboratory lighting.",
  "Concurrently, we tuned our derivative gain Kd to provide critical counter-torque damping, preventing the robot from oscillating off the track during rapid transitions on the Frequency Sweep course.",
  "We also lowered our 7-sensor reflectance comb to a 4 mm ground clearance, expanding the dynamic signal contrast between black electrical tape and white poster board by over 800 percent.",
  "If granted additional development time, we would replace the analog CdS photoresistors with digital infrared phototransistor arrays to eliminate photo-conductive latency and enable significantly higher cruise velocities.",
  "Furthermore, integrating optical wheel encoders for closed-loop motor speed regulation would prevent battery voltage sag from altering our calibrated turn rate over extended competition runs.",
];

const ease = [0.16, 1, 0.3, 1];

export default function Team() {
  return (
    <section id="team" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="TEAM ROSTER"
          title="The Engineers Behind 6ix"
          sub="Four roles, one chassis — every subsystem on the robot has an owner who lived with it through every iteration."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.tid}
              data-testid={`team-card-${m.tid}`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
              className="card-surface group rounded-3xl p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/15 to-mint/10 font-mono text-sm font-bold text-cyan transition-transform duration-300 group-hover:scale-105">
                {m.initials}
              </div>
              <h3 className="mt-5 text-[15px] font-bold text-cream">{m.name}</h3>
              <p className="mt-1.5 text-[12.5px] leading-snug text-mint">{m.role}</p>
              <p className="mt-2.5 text-[12px] leading-relaxed text-mute">{m.bio}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {m.pid && (
                  <span className="rounded-full border border-cyan/30 bg-cyan/5 px-2.5 py-1 font-mono text-[10px] text-cyan">
                    PID {m.pid}
                  </span>
                )}
                <span className="font-mono text-[10px] tracking-wider text-mute">{m.meta}</span>
              </div>
              <a
                href={`mailto:${m.email}`}
                data-testid={`team-email-${m.tid}`}
                className="mt-3 flex items-center gap-2 font-mono text-[11px] text-mute transition-colors hover:text-cyan"
              >
                <Mail size={12} />
                {m.email}
              </a>
            </motion.div>
          ))}
        </div>

        {/* verbatim retrospective */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease }}
          className="card-surface grain relative mt-16 overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16"
          data-testid="retrospective-panel"
        >
          <span className="pointer-events-none absolute -top-8 left-6 select-none font-serif text-[11rem] leading-none text-cyan/[0.07]">&ldquo;</span>
          <p className="font-mono text-[10px] tracking-[0.3em] text-mint">ENGINEERING RETROSPECTIVE — 5 SENTENCES, VERBATIM</p>
          <div className="mt-8 space-y-6">
            {RETROSPECTIVE.map((s, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease }}
                className={`max-w-4xl text-[15px] leading-relaxed sm:text-lg ${i === 0 ? "text-cream" : "text-cream/85"}`}
              >
                {s}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
