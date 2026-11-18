import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1];

export default function SectionHeading({ eyebrow, title, sub, align = "left" }) {
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start";
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease }}
      className={`flex max-w-3xl flex-col ${alignCls}`}
    >
      <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-cyan">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-cream sm:text-4xl lg:text-5xl">{title}</h2>
      {sub && <p className="mt-5 text-[15px] leading-relaxed text-mute sm:text-base">{sub}</p>}
    </motion.div>
  );
}
