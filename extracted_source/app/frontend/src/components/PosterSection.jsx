import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";

const ease = [0.16, 1, 0.3, 1];

export default function PosterSection() {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openLightbox = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
    setOpen(true);
  };

  const at = (z) => {
    setZoom(z);
    if (z === 1) setPos({ x: 0, y: 0 });
  };

  return (
    <section id="poster" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-cyan/[0.04] blur-[130px]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease }}
            className="relative mx-auto w-full max-w-md cursor-pointer"
            onClick={openLightbox}
            data-testid="poster-open-lightbox"
          >
            <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-cyan/15 via-transparent to-mint/15 blur-2xl" />
            <div className="group relative overflow-hidden rounded-2xl border border-edge shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
              <img src="/images/poster_preview.jpeg" alt="Big Hero 6ix academic research poster" className="w-full" data-testid="poster-preview-image" />
              <div className="absolute inset-0 flex items-center justify-center bg-carbon/0 transition-colors duration-300 group-hover:bg-carbon/40">
                <span className="flex h-14 w-14 scale-75 items-center justify-center rounded-full border border-cyan/60 bg-carbon/70 text-cyan opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <Maximize2 size={19} />
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
          >
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-cyan">ACADEMIC CONFERENCE POSTER</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-cream sm:text-4xl lg:text-5xl">
              The Research, at 24&Prime; &times; 36&Prime;
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute">
              Our full academic poster covers the foundational Labs 0–3 — microcontrollers,
              ESP32, analog filters and DSP — and the Lab 4 finale: the design, build and
              competition validation of Big Hero 6ix.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
              {[
                ["SYSTEM BLOCK DIAGRAM", "ESP32-S3 signal chain end-to-end"],
                ["CAD CHASSIS MODEL", "Onshape render of the shrouded frame"],
                ["ELECTRICAL SCHEMATIC", "Sensor dividers, H-bridge, power rails"],
                ["LABS 0–3 → LAB 4", "Foundations through the finale"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-edge bg-surface/60 p-4">
                  <p className="font-mono text-[9.5px] tracking-[0.2em] text-mint">{k}</p>
                  <p className="mt-2 text-[12.5px] leading-snug text-mute">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                data-testid="poster-download-pdf"
                href="/poster.pdf"
                download="BigHero6ix_ECE5_Poster_2x3.pdf"
                onClick={() => toast.success("Downloading the full 2×3 poster PDF")}
                className="flex items-center gap-2.5 rounded-full bg-cyan px-7 py-3.5 text-sm font-bold text-carbon transition-all duration-300 hover:glow-cyan hover:brightness-110"
              >
                <Download size={16} />
                Download Full 2×3 Poster PDF
              </a>
              <button
                data-testid="poster-zoom-button"
                onClick={openLightbox}
                className="flex items-center gap-2.5 rounded-full border border-edge bg-surface/70 px-7 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-cyan/40 hover:text-cyan"
              >
                <Maximize2 size={15} />
                Interactive Zoom
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-carbon/90 p-4 backdrop-blur-xl sm:p-10"
            onClick={() => setOpen(false)}
            data-testid="poster-lightbox"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="relative flex max-h-full flex-col overflow-hidden rounded-2xl border border-edge bg-surface glow-cyan"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => at(zoom > 1 ? 1 : 2.5)}
              data-testid="poster-zoom-stage"
            >
              <div className="relative flex-1 overflow-hidden">
                <img
                  src="/images/poster_preview.jpeg"
                  alt="Big Hero 6ix academic poster, full view"
                  draggable={false}
                  data-testid="poster-zoom-image"
                  className="mx-auto block max-h-[76vh] w-auto select-none"
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: dragRef.current ? "none" : "transform 0.25s ease",
                    cursor: zoom > 1 ? "grab" : "zoom-in",
                  }}
                  onPointerDown={(e) => {
                    if (zoom > 1) {
                      dragRef.current = { sx: e.clientX - pos.x, sy: e.clientY - pos.y };
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }
                  }}
                  onPointerMove={(e) => {
                    if (dragRef.current) setPos({ x: e.clientX - dragRef.current.sx, y: e.clientY - dragRef.current.sy });
                  }}
                  onPointerUp={() => {
                    dragRef.current = null;
                  }}
                />
                <button
                  data-testid="poster-lightbox-close"
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 rounded-full border border-edge bg-carbon/80 p-3 text-cream transition-colors hover:text-cyan"
                  aria-label="Close poster"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge bg-carbon/60 px-4 py-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-mute">DRAG TO PAN · DOUBLE-CLICK TO ZOOM</span>
                <div className="flex items-center gap-2">
                  <button data-testid="poster-zoom-out" onClick={() => at(Math.max(1, zoom - 0.5))} className="rounded-lg border border-edge px-3 py-1.5 text-cream transition-colors hover:border-cyan/40 hover:text-cyan" aria-label="Zoom out">
                    <Minus size={13} />
                  </button>
                  <span data-testid="poster-zoom-level" className="w-14 text-center font-mono text-xs text-cyan">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button data-testid="poster-zoom-in" onClick={() => at(Math.min(4, zoom + 0.5))} className="rounded-lg border border-edge px-3 py-1.5 text-cream transition-colors hover:border-cyan/40 hover:text-cyan" aria-label="Zoom in">
                    <Plus size={13} />
                  </button>
                  <button data-testid="poster-zoom-reset" onClick={() => at(1)} className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 font-mono text-[10px] tracking-wider text-mute transition-colors hover:text-cream">
                    <RotateCcw size={11} />
                    RESET
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
