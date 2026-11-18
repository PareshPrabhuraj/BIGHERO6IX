import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Pause, Play, RotateCcw, SlidersHorizontal, Usb } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import { buildTrack, sampleDark, SENSOR_OFFSETS, TRACK_W, TRACK_H } from "../lib/track";

const DT = 1 / 60;
const OMEGA_GAIN = 0.004;
const V_GAIN = 0.05;
const FWD = 22;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = [0.16, 1, 0.3, 1];

const PRESETS = [
  { name: "Optimal Tune", speed: 60, kp: 32, ki: 6, kd: 22, hint: "Smooth cornering, zero oscillation", tid: "preset-optimal" },
  { name: "Under-Damped", speed: 70, kp: 65, ki: 0, kd: 2, hint: "High Kp, zero Kd — violent oscillation", tid: "preset-underdamped" },
  { name: "Sluggish P-Only", speed: 50, kp: 12, ki: 0, kd: 0, hint: "Low Kp — under-steers off sharp bends", tid: "preset-ponly" },
  { name: "Drag Race", speed: 90, kp: 20, ki: 2, kd: 28, hint: "High speed, heavy Kd damping", tid: "preset-drag" },
];

function respawn(S, track) {
  const p = track.dense[S.nearest % track.dense.length];
  const q = track.dense[(S.nearest + 4) % track.dense.length];
  S.x = p.x;
  S.y = p.y;
  S.h = Math.atan2(q.y - p.y, q.x - p.x);
  S.sumE = 0;
  S.prevE = 0;
  S.e = 0;
  S.turn = 0;
  S.lost = 0;
  S.flash = 0.8;
  S.trail = [];
}

function initSim(track) {
  const S = {
    x: 0, y: 0, h: 0, nearest: 0, laps: 0, time: 0, progress: 0,
    sumE: 0, prevE: 0, e: 0, turn: 0, lp: 60, rp: 60, v: 0, lost: 0, flash: 0,
    status: "TRACKING", readings: new Array(7).fill(0), trail: [], hist: new Array(100).fill(0),
  };
  respawn(S, track);
  return S;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function PIDLab() {
  const canvasRef = useRef(null);
  const waveRef = useRef(null);
  const trackRef = useRef(null);
  const simRef = useRef(null);
  const runRef = useRef(true);
  const paramsRef = useRef({ speed: 60, kp: 32, ki: 6, kd: 22 });
  const barLRef = useRef(null);
  const barRRef = useRef(null);
  const combRefs = useRef([]);
  const [params, setParams] = useState({ speed: 60, kp: 32, ki: 6, kd: 22 });
  const [running, setRunning] = useState(true);
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState({ e: 0, turn: 0, v: 0, laps: 0, t: 0, progress: 0, status: "TRACKING", lp: 60, rp: 60 });
  const [mode, setMode] = useState("sim");
  const modeRef = useRef("sim");
  const [hwStatus, setHwStatus] = useState("DISCONNECTED");
  const hwStatusRef = useRef("DISCONNECTED");
  const hwRef = useRef({ e: 0, lp: 0, rp: 0, ldr: new Array(7).fill(0), frames: 0 });
  const linkRef = useRef({ ws: null, buf: "" });
  const [wsUrl, setWsUrl] = useState("");

  const apply = (next) => {
    paramsRef.current = next;
    setParams(next);
  };

  useEffect(() => {
    const track = buildTrack();
    trackRef.current = track;
    simRef.current = initSim(track);
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = (ev) => {
      const d = ev.detail || {};
      apply({ speed: d.speed, kp: d.kp, ki: d.ki, kd: d.kd });
      toast.success(`Tune loaded into lab: ${d.name || "competition preset"}`);
    };
    window.addEventListener("bh6:load-tune", handler);
    return () => window.removeEventListener("bh6:load-tune", handler);
  }, []);

  useEffect(
    () => () => {
      try {
        linkRef.current.ws?.close();
      } catch {}
    },
    []
  );

  const setHw = (s) => {
    hwStatusRef.current = s;
    setHwStatus(s);
  };

  const parseLine = (line) => {
    const t = line.trim();
    if (!t) return null;
    if (t.startsWith("{")) {
      try {
        const j = JSON.parse(t);
        const arr = Array.isArray(j.ldr) ? j.ldr : Array.isArray(j.sensors) ? j.sensors : null;
        if (arr || j.e !== undefined) {
          const norm = arr ? arr.slice(0, 7).map((v) => (v > 1 ? v / 4095 : v)) : null;
          return { ldr: norm, e: Number(j.e) || 0, lp: Number(j.l ?? j.lp) || 0, rp: Number(j.r ?? j.rp) || 0 };
        }
      } catch {}
    }
    const nums = t.split(/[,\s;|]+/).map(Number).filter((n) => !Number.isNaN(n));
    if (/^BH6/i.test(t) && nums.length >= 10) {
      return { ldr: nums.slice(0, 7).map((v) => (v > 1 ? v / 4095 : v)), e: nums[7], lp: nums[8], rp: nums[9] };
    }
    const m = t.match(/e\s*=\s*([-\d.]+)/);
    const l = t.match(/L\s*=\s*(\d+)/);
    const r = t.match(/R\s*=\s*(\d+)/);
    if (m && l && r) return { ldr: null, e: parseFloat(m[1]), lp: +l[1], rp: +r[1] };
    if (nums.length >= 10) {
      return { ldr: nums.slice(0, 7).map((v) => (v > 1 ? v / 4095 : v)), e: nums[7], lp: nums[8], rp: nums[9] };
    }
    if (nums.length >= 3) return { ldr: null, e: nums[nums.length - 3], lp: nums[nums.length - 2], rp: nums[nums.length - 1] };
    return null;
  };

  const handleTelemetry = (p) => {
    const hw = hwRef.current;
    hw.e = clamp(p.e, -3, 3);
    hw.lp = clamp(p.lp, 0, 100);
    hw.rp = clamp(p.rp, 0, 100);
    if (p.ldr) hw.ldr = p.ldr.map((v) => clamp(v, 0, 1));
    hw.frames += 1;
    const S = simRef.current;
    if (S) {
      S.hist.push(hw.e);
      if (S.hist.length > 100) S.hist.shift();
    }
  };

  const connectSerial = async () => {
    if (!("serial" in navigator)) {
      toast.error("WebSerial needs Chrome/Edge over HTTPS — use the WebSocket bridge instead");
      return;
    }
    try {
      setHw("CONNECTING");
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setHw("LIVE");
      toast.success("Serial link open — 9600 baud USB CDC");
      const dec = new TextDecoder();
      while (port.readable) {
        const reader = port.readable.getReader();
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            linkRef.current.buf += dec.decode(value, { stream: true });
            const lines = linkRef.current.buf.split("\n");
            linkRef.current.buf = lines.pop();
            lines.forEach((l) => {
              const p = parseLine(l);
              if (p) handleTelemetry(p);
            });
          }
        } catch {
          break;
        } finally {
          reader.releaseLock();
        }
      }
      setHw("DISCONNECTED");
    } catch (err) {
      setHw("DISCONNECTED");
      toast.error(`Serial: ${err?.message || err}`);
    }
  };

  const connectWs = () => {
    if (!wsUrl) {
      toast.error("Enter a WebSocket URL first");
      return;
    }
    try {
      linkRef.current.ws?.close();
      const ws = new WebSocket(wsUrl);
      linkRef.current.ws = ws;
      setHw("CONNECTING");
      ws.onopen = () => {
        setHw("LIVE");
        toast.success("WebSocket telemetry link open");
      };
      ws.onmessage = (ev) => {
        String(ev.data)
          .split("\n")
          .forEach((l) => {
            const p = parseLine(l);
            if (p) handleTelemetry(p);
          });
      };
      ws.onclose = () => setHw("DISCONNECTED");
      ws.onerror = () => setHw("DISCONNECTED");
    } catch {
      toast.error("Invalid WebSocket URL");
    }
  };

  const switchMode = (m) => {
    modeRef.current = m;
    setMode(m);
    if (m === "hw") toast.info("Hardware Live Mode — connect the 9600 baud USB CDC stream");
    else toast.success("Physics Simulation Mode — digital twin running");
  };

  const resetRobot = () => {
    const track = trackRef.current;
    if (!track) return;
    const S = simRef.current;
    S.nearest = 0;
    S.laps = 0;
    S.time = 0;
    respawn(S, track);
    toast.success("Robot reset to the start line");
  };

  const toggleRun = () => {
    runRef.current = !runRef.current;
    setRunning(runRef.current);
  };

  const statusColor =
    mode === "hw"
      ? hwStatus === "LIVE" ? "text-mint border-mint/40 bg-mint/10"
        : hwStatus === "CONNECTING" ? "text-amber-400 border-amber-400/40 bg-amber-400/10"
        : "text-red-400 border-red-400/40 bg-red-400/10"
      : hud.status === "TRACKING" ? "text-mint border-mint/40 bg-mint/10"
        : hud.status === "CORRECTING" ? "text-cyan border-cyan/40 bg-cyan/10"
        : hud.status === "LINE LOST" ? "text-red-400 border-red-400/40 bg-red-400/10"
        : "text-amber-400 border-amber-400/40 bg-amber-400/10";

  const SLIDERS = [
    { key: "speed", label: "Base Speed", tid: "slider-speed" },
    { key: "kp", label: "Proportional Gain · Kp", tid: "slider-kp" },
    { key: "ki", label: "Integral Gain · Ki", tid: "slider-ki" },
    { key: "kd", label: "Derivative Gain · Kd", tid: "slider-kd" },
  ];

  return (
    <section id="lab" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute right-[-160px] top-24 h-[520px] w-[520px] rounded-full bg-mint/[0.045] blur-[140px]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="THE CROWN JEWEL"
          title="Real-Time PID Simulation Lab"
          sub="A physics-true digital twin of Big Hero 6ix: 7 raycast reflectance sensors, differential-drive kinematics and the exact closed-loop PID law flown on hardware. Tune it live — or wire in the real robot."
        />

        <div className="mt-14 grid gap-5 xl:grid-cols-[1.62fr_1fr]">
          {/* canvas + HUD */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease }}
            className="card-surface rounded-3xl p-4 sm:p-6"
          >
            <div className="relative overflow-hidden rounded-2xl border border-edge shadow-[0_0_60px_rgba(0,240,255,0.08)]">
              <canvas
                ref={canvasRef}
                data-testid="pid-sim-canvas"
                className="block h-auto w-full"
                style={{ aspectRatio: "960/620" }}
              />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span
                  data-testid="sim-status-pill"
                  className={`rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] backdrop-blur-md ${statusColor}`}
                >
                  {mode === "hw" ? (hwStatus === "LIVE" ? "HARDWARE LIVE" : hwStatus) : hud.status}
                </span>
                <span className="rounded-full border border-edge bg-carbon/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-mute backdrop-blur-md">
                  {mode === "hw" ? `RX ${hud.t}` : `LAP ${hud.laps}`}
                </span>
              </div>
              <div className="absolute inset-x-4 top-4 flex justify-end">
                <div className="w-28 rounded-full border border-edge bg-carbon/70 p-1 backdrop-blur-md">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan to-mint transition-all duration-200" style={{ width: `${Math.round(hud.progress * 100)}%` }} />
                </div>
              </div>
              {mode === "hw" && (
                <div className="absolute bottom-4 right-4 rounded-full border border-mint/40 bg-carbon/70 px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] text-mint backdrop-blur-md" data-testid="hw-twin-badge">
                  TWIN PARKED — STREAMING LIVE
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {(mode === "hw"
                ? [
                    ["ERROR e(t)", hud.e.toFixed(3), "testid-hud-error"],
                    ["LEFT PWM", `${Math.round(hud.lp)} %`, "testid-hud-turn"],
                    ["RIGHT PWM", `${Math.round(hud.rp)} %`, "testid-hud-velocity"],
                    ["RX FRAMES", `${hud.t}`, "testid-hud-time"],
                  ]
                : [
                    ["ERROR e(t)", hud.e.toFixed(3), "testid-hud-error"],
                    ["TURN RATE", `${hud.turn.toFixed(1)} °/s`, "testid-hud-turn"],
                    ["VELOCITY", `${Math.round(hud.v)} px/s`, "testid-hud-velocity"],
                    ["RUN TIME", `${hud.t.toFixed(1)} s`, "testid-hud-time"],
                  ]
              ).map(([label, value, tid]) => (
                <div key={label} data-testid={tid} className="rounded-2xl border border-edge bg-carbon/60 p-3.5">
                  <p className="font-mono text-[9px] tracking-[0.22em] text-mute">{label}</p>
                  <p className="mt-1.5 font-mono text-lg font-bold text-cream">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
              <div className="rounded-2xl border border-edge bg-carbon/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] tracking-[0.22em] text-mute">
                    {mode === "hw" ? "ERROR WAVEFORM — LIVE e(t) STREAM" : "ERROR WAVEFORM — LAST 100 FRAMES"}
                  </p>
                  <p className="font-mono text-[9px] text-mute">±3.0</p>
                </div>
                <canvas ref={waveRef} data-testid="sim-error-waveform" className="mt-2 h-[74px] w-full" />
              </div>
              <div className="rounded-2xl border border-edge bg-carbon/60 p-4">
                <p className="font-mono text-[9px] tracking-[0.22em] text-mute">MOTOR PWM</p>
                <div className="mt-2 flex h-[74px] items-end justify-around px-2">
                  <div className="flex h-full w-8 items-end rounded-md bg-edge/50">
                    <div ref={barLRef} data-testid="pwm-bar-left" className="w-full rounded-md bg-gradient-to-t from-mint to-cyan" style={{ height: "60%" }} />
                  </div>
                  <div className="flex h-full w-8 items-end rounded-md bg-edge/50">
                    <div ref={barRRef} data-testid="pwm-bar-right" className="w-full rounded-md bg-gradient-to-t from-mint to-cyan" style={{ height: "60%" }} />
                  </div>
                </div>
                <div className="mt-1.5 flex justify-around font-mono text-[9px] text-mute">
                  <span>L {Math.round(hud.lp)}</span>
                  <span>R {Math.round(hud.rp)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* control panel */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.12, ease }}
            className="flex flex-col gap-5"
          >
            {/* mode toggle */}
            <div className="flex rounded-2xl border border-edge bg-surface/60 p-1.5">
              <button
                data-testid="mode-toggle-sim"
                onClick={() => switchMode("sim")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-all duration-300 ${
                  mode === "sim" ? "bg-cyan text-carbon" : "text-mute hover:text-cream"
                }`}
              >
                <SlidersHorizontal size={13} />
                Physics Simulation
              </button>
              <button
                data-testid="mode-toggle-hw"
                onClick={() => switchMode("hw")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-all duration-300 ${
                  mode === "hw" ? "bg-mint text-carbon" : "text-mute hover:text-cream"
                }`}
              >
                <Usb size={13} />
                Hardware Live
              </button>
            </div>

            <div className="card-surface rounded-3xl p-6 sm:p-7">
              <div className="flex items-center gap-2.5">
                {mode === "sim" ? (
                  <SlidersHorizontal size={15} className="text-cyan" />
                ) : (
                  <Usb size={15} className="text-mint" />
                )}
                <h3 className="font-mono text-[11px] tracking-[0.28em] text-cream">
                  {mode === "sim" ? "CONTROL DECK" : "TELEMETRY LINK — 9600 BAUD USB CDC"}
                </h3>
              </div>

              {mode === "hw" ? (
                <div className="mt-5 space-y-4" data-testid="hw-link-panel">
                  <p className="text-[12px] leading-relaxed text-mute">
                    Streams raw LDR 0–6 values, computed centroid error e and Left/Right PWM
                    outputs straight into the live charts. Plug the ESP32-S3 in over USB-C and connect.
                  </p>
                  <button
                    data-testid="hw-serial-connect"
                    onClick={connectSerial}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-[13px] font-semibold text-mint transition-all hover:glow-mint"
                  >
                    <Usb size={14} />
                    Connect via WebSerial (USB)
                  </button>
                  <div className="flex gap-2">
                    <input
                      data-testid="hw-ws-input"
                      value={wsUrl}
                      onChange={(e) => setWsUrl(e.target.value)}
                      placeholder="ws://esp32-ip:81/telemetry"
                      className="w-full rounded-xl border border-edge bg-carbon/70 px-3.5 py-2.5 font-mono text-[12px] text-cream placeholder:text-mute/50 focus:border-cyan/50 focus:outline-none"
                    />
                    <button
                      data-testid="hw-ws-connect"
                      onClick={connectWs}
                      className="shrink-0 rounded-xl border border-edge bg-carbon/60 px-4 py-2.5 text-[12px] font-semibold text-cream transition-colors hover:border-cyan/40 hover:text-cyan"
                    >
                      Connect WS
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-edge bg-carbon/50 px-4 py-3">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-mute">LINK STATUS</span>
                    <span
                      data-testid="hw-status-pill"
                      className={`font-mono text-[11px] font-bold tracking-wider ${
                        hwStatus === "LIVE" ? "text-mint" : hwStatus === "CONNECTING" ? "text-amber-400" : "text-red-400"
                      }`}
                    >
                      {hwStatus}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] leading-relaxed text-mute/80">
                    ACCEPTED FORMATS: {"{ ldr:[7], e, l, r }"} JSON · CSV “BH6, l0..l6, e, l, r” · “e=… L=… R=…”
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6 space-y-6">
                    {SLIDERS.map((s) => (
                      <div key={s.key}>
                        <div className="flex items-center justify-between">
                          <label htmlFor={s.tid} className="text-[13px] font-medium text-mute">{s.label}</label>
                          <span data-testid={`${s.tid}-value`} className="rounded-md border border-edge bg-carbon/70 px-2.5 py-1 font-mono text-xs font-bold text-cyan">
                            {params[s.key]}
                          </span>
                        </div>
                        <input
                          id={s.tid}
                          data-testid={s.tid}
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={params[s.key]}
                          onChange={(ev) => apply({ ...paramsRef.current, [s.key]: +ev.target.value })}
                          className="bh6-slider mt-3"
                          style={{ "--fill": `${params[s.key]}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 flex gap-3">
                    <button
                      data-testid="sim-pause-button"
                      onClick={toggleRun}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-edge bg-carbon/60 px-4 py-3 text-[13px] font-semibold text-cream transition-colors hover:border-cyan/40 hover:text-cyan"
                    >
                      {running ? <Pause size={14} /> : <Play size={14} />}
                      {running ? "Pause" : "Play"}
                    </button>
                    <button
                      data-testid="sim-reset-button"
                      onClick={resetRobot}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-[13px] font-semibold text-mint transition-all hover:glow-mint"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>

            {mode === "sim" && (
              <div className="card-surface rounded-3xl p-6 sm:p-7">
                <h3 className="font-mono text-[11px] tracking-[0.28em] text-cream">ONE-CLICK PRESETS</h3>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {PRESETS.map((p) => (
                    <button
                      key={p.tid}
                      data-testid={p.tid}
                      onClick={() => {
                        apply({ speed: p.speed, kp: p.kp, ki: p.ki, kd: p.kd });
                        toast.success(`Preset: ${p.name}`);
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                        params.kp === p.kp && params.kd === p.kd && params.speed === p.speed
                          ? "border-cyan/50 bg-cyan/[0.07] glow-cyan"
                          : "border-edge bg-carbon/50 hover:border-cyan/30"
                      }`}
                    >
                      <p className="text-[13px] font-bold text-cream">{p.name}</p>
                      <p className="mt-1 text-[10.5px] leading-snug text-mute">{p.hint}</p>
                      <p className="mt-2.5 font-mono text-[10px] text-cyan">
                        v{p.speed} · Kp{p.kp} · Ki{p.ki} · Kd{p.kd}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-edge bg-surface/50 p-6">
              <p className="font-mono text-[9px] tracking-[0.22em] text-mute">
                {mode === "hw" ? "SENSOR COMB — LIVE LDR 0–6" : "SENSOR COMB — 7-CHANNEL READOUT"}
              </p>
              <div className="mt-4 flex justify-between">
                {SENSOR_OFFSETS.map((off, i) => (
                  <div key={off} className="flex flex-col items-center gap-2">
                    <div
                      ref={(el) => (combRefs.current[i] = el)}
                      data-testid={`sensor-bar-${i}`}
                      className="h-10 w-2.5 rounded-full bg-cyan"
                      style={{ opacity: 0.25 }}
                    />
                    <span className="font-mono text-[9px] text-mute">{off > 0 ? `+${off}` : off}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
