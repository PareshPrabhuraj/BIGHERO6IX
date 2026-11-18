import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import { SKETCHES } from "../lib/codeSnippets";
import { highlightCpp } from "../lib/highlight";

const ease = [0.16, 1, 0.3, 1];

export default function CodeStudio() {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const sketch = SKETCHES[tab];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sketch.code);
      setCopied(true);
      toast.success(`${sketch.name} copied to clipboard`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="EMBEDDED CODE STUDIO"
          title="The Firmware, Unabridged"
          sub="The four Arduino C++ sketches that bring Big Hero 6ix to life — from the production PID loop to the per-challenge bench code."
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease }}
          className="mt-12 overflow-hidden rounded-3xl border border-edge bg-[#08090C]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-4 py-3 sm:px-6">
            <div className="flex flex-wrap gap-1.5">
              {SKETCHES.map((s, i) => (
                <button
                  key={s.name}
                  data-testid={`code-tab-${i}`}
                  onClick={() => setTab(i)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] transition-all duration-300 ${
                    tab === i
                      ? "bg-cyan/10 text-cyan shadow-[inset_0_0_0_1px_rgba(0,240,255,0.3)]"
                      : "text-mute hover:bg-white/[0.04] hover:text-cream"
                  }`}
                >
                  <FileCode2 size={12} />
                  <span className="hidden sm:inline">{s.name}</span>
                  <span className="sm:hidden">{`.ino ${i + 1}`}</span>
                </button>
              ))}
            </div>
            <button
              data-testid="code-copy-button"
              onClick={copy}
              className="flex items-center gap-2 rounded-lg border border-edge px-3.5 py-2 font-mono text-[11px] text-cream transition-all duration-300 hover:border-cyan/40 hover:text-cyan"
            >
              {copied ? <Check size={12} className="text-mint" /> : <Copy size={12} />}
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={sketch.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between border-b border-edge/60 bg-surface/40 px-4 py-2.5 sm:px-6">
                <span className="font-mono text-[11px] text-mint">{sketch.name}</span>
                <span className="font-mono text-[10px] tracking-wider text-mute">{sketch.label}</span>
              </div>
              <pre
                data-testid="code-panel"
                className="max-h-[540px] overflow-auto p-5 font-mono text-[12px] leading-[1.75] text-[#B9C2CF] sm:p-7 sm:text-[12.5px]"
              >
                <code>{highlightCpp(sketch.code)}</code>
              </pre>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
