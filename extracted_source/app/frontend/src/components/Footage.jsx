import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import SectionHeading from "./SectionHeading";

const VIDEOS = [
  {
    id: "yt-1",
    title: "Drag Race — Official Run",
    sub: "Onboard the 4.82-second full-throttle sprint",
    thumb: "/images/footage_thumb.jpeg",
    embed: "https://www.youtube-nocookie.com/embed/ZM8ECpBuQYE",
    tag: "TRACK 1",
  },
  {
    id: "yt-2",
    title: "Frequency Sweep — Bench Session",
    sub: "Kp 46 snapping through alternating S-curves",
    thumb: "/images/hero_robot.jpeg",
    embed: "https://www.youtube-nocookie.com/embed/IXDD0cY0MnE",
    tag: "TRACK 2",
  },
];

const ease = [0.16, 1, 0.3, 1];

export default function Footage() {
  const [playing, setPlaying] = useState({});

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="VIDEO & ACTION FOOTAGE"
          title="Race-Day Proof"
          sub="Run footage from the lab and the official course — the robot doing exactly what the firmware was tuned to do."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VIDEOS.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease }}
              className="group overflow-hidden rounded-3xl border border-edge bg-surface transition-shadow duration-500 hover:glow-cyan"
              data-testid={`video-card-${v.id}`}
            >
              <div className="relative aspect-video">
                {playing[v.id] ? (
                  <iframe
                    src={`${v.embed}?autoplay=1`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button className="absolute inset-0 h-full w-full" onClick={() => setPlaying((p) => ({ ...p, [v.id]: true }))} data-testid={`video-play-${v.id}`}>
                    <img src={v.thumb} alt={v.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    <span className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/20 to-transparent" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan/50 bg-carbon/60 text-cyan backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                        <Play size={20} className="ml-0.5" />
                      </span>
                    </span>
                    <span className="absolute left-4 top-4 rounded-full border border-edge bg-carbon/70 px-3 py-1 font-mono text-[9px] tracking-[0.25em] text-cyan backdrop-blur-md">
                      {v.tag}
                    </span>
                  </button>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-[15px] font-bold text-cream">{v.title}</h3>
                <p className="mt-1 text-[12.5px] text-mute">{v.sub}</p>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="group overflow-hidden rounded-3xl border border-edge bg-surface transition-shadow duration-500 hover:glow-mint"
            data-testid="video-card-local"
          >
            <div className="relative aspect-video">
              <video
                src="/media/demo-clip.mp4"
                poster="/images/part_chassis.jpeg"
                controls
                playsInline
                preload="none"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-mint/40 bg-carbon/70 px-3 py-1 font-mono text-[9px] tracking-[0.25em] text-mint backdrop-blur-md">
                LOCAL · BENCH REPLAY
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-[15px] font-bold text-cream">Chassis Walkaround — Local Clip</h3>
              <p className="mt-1 text-[12.5px] text-mute">Low-CG battery bay, caster and cantilever comb up close</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
