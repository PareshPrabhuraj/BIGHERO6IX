import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import SectionHeading from "./SectionHeading";

const CARDS = [
  {
    id: "esp32",
    img: "/images/part_esp32.jpeg",
    title: "ESP32-S3 Core Compute Brain",
    sub: "240 MHz dual-core Xtensa LX7 · 12-bit ADC · USB CDC telemetry",
    callouts: [
      ["MCU", "Dual-core Xtensa LX7 @ 240 MHz"],
      ["ADC", "12-bit SAR — resolves the 3400 vs 420 count contrast"],
      ["COMMS", "USB CDC serial telemetry active on boot"],
      ["LOGIC", "Native 3.3 V rail, isolated from motor power"],
    ],
    span: "md:col-span-7",
  },
  {
    id: "comb",
    img: "/images/part_sensor_comb.jpeg",
    title: "7-LDR Optoelectronic Comb",
    sub: "Infrared/visible optical reflectance array · 5 mm CdS cells",
    callouts: [
      ["SENSORS", "7 × 5 mm CdS photoresistors"],
      ["DIVIDERS", "10 kΩ pull-down network per channel"],
      ["HEIGHT", "Calibrated to 4 mm ground clearance"],
      ["CONTRAST", "+800% signal swing, tape vs floor"],
    ],
    span: "md:col-span-5",
  },
  {
    id: "l298n",
    img: "/images/part_l298n.jpeg",
    title: "L298N Dual H-Bridge Driver",
    sub: "Bi-directional high-current DC motor drive",
    callouts: [
      ["OUTPUT", "Dual 2 A full-bridge channels"],
      ["PWM", "Speed control on IO8 / IO13"],
      ["DIR", "Direction logic on IO9–IO12"],
      ["POWER", "5 V regulator jumper isolated from USB-C logic"],
    ],
    span: "md:col-span-5",
  },
  {
    id: "pots",
    img: "/images/part_pots.jpeg",
    title: "4-Channel Analog Tuning Cockpit",
    sub: "Clockwise-increasing rotary pots for live gain trimming",
    callouts: [
      ["IO4", "Base Speed"],
      ["IO3", "Proportional gain — Kp"],
      ["IO2", "Integral gain — Ki"],
      ["IO1", "Derivative gain — Kd"],
    ],
    span: "md:col-span-7",
  },
  {
    id: "frame",
    img: "/images/part_chassis.jpeg",
    title: "Low-CG Power & Frame",
    sub: "Custom 6×AA 9V battery bay and front ball caster",
    callouts: [
      ["POWER", "6×AA pack — 9.0 V nominal, mounted low-CG"],
      ["CASTER", "Omnidirectional front ball caster"],
      ["SHROUD", "3D-printed black PLA ambient light shroud"],
      ["COMB", "Rigid cantilever sensor comb"],
    ],
    span: "md:col-span-12",
  },
];

const ease = [0.16, 1, 0.3, 1];

export default function HardwareBento() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="anatomy" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute left-[-200px] top-1/3 h-[480px] w-[480px] rounded-full bg-cyan/[0.04] blur-[130px]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="HARDWARE ANATOMY"
          title="Every Subsystem, Under the Spotlight"
          sub="Five bento cards, one machine. Click any card for the high-res diagram and exact pinout callouts."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12">
          {CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              data-testid={`bento-card-${card.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
              onClick={() => setOpen(card)}
              className={`card-surface group relative overflow-hidden rounded-3xl text-left ${card.span}`}
            >
              <div className={`relative overflow-hidden ${card.id === "frame" ? "h-64 md:h-72" : "h-60"}`}>
                <img
                  src={card.img}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />
                <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full glass border border-edge px-3 py-1.5 font-mono text-[10px] tracking-widest text-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn size={11} /> OPEN SCHEMATIC
                </span>
              </div>
              <div className="relative p-6 pt-2">
                <h3 className="text-lg font-bold tracking-tight text-cream">{card.title}</h3>
                <p className="mt-1.5 text-[13px] text-mute">{card.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* modal lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-carbon/85 p-4 backdrop-blur-xl sm:p-8"
            onClick={() => setOpen(null)}
            data-testid="bento-modal-backdrop"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              data-testid={`bento-modal-${open.id}`}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-edge bg-surface glow-cyan"
            >
              <div className="relative">
                <img src={open.img} alt={open.title} className="h-64 w-full object-cover sm:h-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <button
                  data-testid="bento-modal-close"
                  onClick={() => setOpen(null)}
                  className="absolute right-4 top-4 rounded-full border border-edge bg-carbon/70 p-2.5 text-cream transition-colors hover:text-cyan"
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="p-7 sm:p-9">
                <p className="font-mono text-[10px] tracking-[0.3em] text-cyan">DIAGRAM CALLOUTS</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-cream">{open.title}</h3>
                <p className="mt-1.5 text-sm text-mute">{open.sub}</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {open.callouts.map(([k, v]) => (
                    <div key={k} className="rounded-2xl border border-edge bg-carbon/50 p-4">
                      <p className="font-mono text-[10px] tracking-[0.25em] text-mint">{k}</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-cream">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
