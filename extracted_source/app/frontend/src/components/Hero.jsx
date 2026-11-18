import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Cpu, Zap, ArrowDown } from "lucide-react";
import { scrollToId } from "../App";

const STATS = [
  { value: "240 MHz", label: "Dual-Core Xtensa LX7 MCU", testid: "stat-mcu" },
  { value: "7 Sensors", label: "Discrete Optical Reflectance Array (4 mm Calibrated Ground Clearance)", testid: "stat-sensors" },
  { value: "<2 ms", label: "High-Frequency Closed-Loop PID Correction Latency", testid: "stat-latency" },
  { value: "2.0 A Peak", label: "Dual Full-Bridge L298N Motor Driver with Isolated Power Rails", testid: "stat-current" },
];

const ease = [0.16, 1, 0.3, 1];
const LINES = [
  { pre: "Precision in Every ", hl: "Millimeter." },
  { pre: "Control in Every ", hl: "Millisecond." },
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const txtY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });

  const onTilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const onUntilt = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section id="overview" ref={ref} className="relative overflow-hidden pb-20 pt-32 lg:pt-40">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-cyan/[0.055] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-180px] top-[340px] h-[420px] w-[420px] rounded-full bg-mint/[0.05] blur-[120px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
        <motion.div style={{ y: txtY }}>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="font-mono text-[11px] font-semibold tracking-[0.3em] text-cyan"
          >
            AUTONOMOUS OPTOELECTRONIC MOBILE ROBOTICS
          </motion.p>

          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-cream sm:text-6xl xl:text-[4.6rem]">
            {LINES.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: "112%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.18 + i * 0.14, ease }}
                >
                  {line.pre}
                  <span className="text-glow-cyan text-cyan">{line.hl}</span>
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-7 max-w-xl text-[15px] leading-relaxed text-mute sm:text-base"
          >
            Engineered by Team Big Hero 6ix for UC San Diego ECE 5. Featuring dual-core
            ESP32-S3 processing, 7-channel optoelectronic reflectance sensing, real-time
            analog PID parameter trimming, and high-traction differential drive actuation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              data-testid="hero-cta-pid-lab"
              onClick={() => scrollToId("lab")}
              className="group flex items-center gap-2.5 rounded-full bg-cyan px-7 py-3.5 text-sm font-bold text-carbon transition-all duration-300 hover:glow-cyan hover:brightness-110"
            >
              <Zap size={16} className="transition-transform duration-300 group-hover:rotate-12" />
              Launch PID Simulation Lab
            </button>
            <button
              data-testid="hero-cta-hardware"
              onClick={() => scrollToId("anatomy")}
              className="flex items-center gap-2.5 rounded-full border border-edge bg-surface/70 px-7 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-cyan/40 hover:text-cyan"
            >
              <Cpu size={16} />
              Explore Hardware Architecture
            </button>
          </motion.div>
        </motion.div>

        {/* robot visual — 3D tilt + parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease }}
          className="relative"
          style={{ perspective: 1200 }}
          onMouseMove={onTilt}
          onMouseLeave={onUntilt}
        >
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            className="grain relative overflow-hidden rounded-3xl border border-edge bg-surface"
          >
            <motion.img
              src="/images/hero_robot.jpeg"
              alt="Big Hero 6ix autonomous line-following robot"
              data-testid="hero-robot-image"
              style={{ y: imgY, scale: 1.12 }}
              className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[480px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon/85 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full glass border border-mint/30 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
              <span className="font-mono text-[10px] tracking-widest text-mint">SENSOR COMB — LIVE</span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-cyan">UNIT BH6-01</p>
                <p className="mt-1 text-sm font-semibold text-cream">Differential Drive · 7-Ch Reflectance</p>
              </div>
              <div className="rounded-xl border border-edge bg-carbon/70 px-3.5 py-2 text-right backdrop-blur-md">
                <p className="font-mono text-lg font-bold leading-none text-cyan">&lt;2<span className="text-xs text-mute">ms</span></p>
                <p className="mt-1 font-mono text-[9px] tracking-widest text-mute">PID LOOP</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* stat strip */}
      <div className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.testid}
              data-testid={s.testid}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
              className="card-surface glow-cyan rounded-2xl p-5 sm:p-6"
            >
              <p className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-2.5 text-[11px] leading-relaxed text-mute sm:text-xs">{s.label}</p>
            </motion.div>
          ))}
        </div>
        <motion.button
          data-testid="hero-scroll-cue"
          onClick={() => scrollToId("timeline")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mx-auto mt-16 flex flex-col items-center gap-2 text-mute transition-colors hover:text-cyan"
        >
          <span className="font-mono text-[10px] tracking-[0.3em]">THE BUILD</span>
          <ArrowDown size={15} className="animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
}
