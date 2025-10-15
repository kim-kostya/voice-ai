"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

// Your cards live under src/app, so import them from there and render client-side only
const WeatherCard = dynamic(() => import("../app/WeatherCard"), { ssr: false });
const CalendarCard = dynamic(() => import("../app/CalendarCard"), { ssr: false });

/**
 * HomeMicChatPage — Homepage with Mic + optional Chat panel (hydration-safe)
 * Left sidebar shows Weather, Calendar, Reminders stacked.
 */

type MicrophoneState = "idle" | "listening" | "fallback" | "error";

type PermissionStateValue = "granted" | "denied" | "prompt" | "unsupported";

type NavigatorWithPermissions = Navigator & {
  permissions?: {
    query?: (descriptor: { name: "microphone" }) => Promise<{ state: "granted" | "denied" | "prompt" }>;
  };
};

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function envDiagnostics() {
  const secure = typeof window !== "undefined" && window.isSecureContext === true;
  const hasMediaDevices = typeof navigator !== "undefined" && typeof navigator.mediaDevices !== "undefined";
  const hasGetUserMedia = hasMediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";
  const hasPermissionsAPI = typeof navigator !== "undefined" && "permissions" in navigator;
  return { secure, hasMediaDevices, hasGetUserMedia, hasPermissionsAPI };
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

async function getMicPermissionState(): Promise<PermissionStateValue> {
  if (typeof navigator === "undefined") return "unsupported";
  const nav = navigator as NavigatorWithPermissions;
  const query = nav.permissions?.query;
  if (typeof query !== "function") return "unsupported";
  try {
    const result = await query({ name: "microphone" });
    const s = result?.state;
    return s === "granted" || s === "denied" || s === "prompt" ? s : "unsupported";
  } catch {
    return "unsupported";
  }
}

function useAudioLevel(opts?: { smoothing?: number; fftSize?: number; simulate?: boolean }) {
  const smoothing = opts?.smoothing ?? 0.9;
  const fftSize = opts?.fftSize ?? 2048;
  const simulate = Boolean(opts?.simulate);

  const [level, setLevel] = useState(0);
  const [state, setState] = useState<MicrophoneState>("idle");
  const [error, setError] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gainRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
    setState("idle");
  }, []);

  useEffect(() => () => stop(), [stop]);

  const startSim = useCallback(() => {
    setError(null);
    setState("fallback");
    const startedAt = performance.now();
    const loop = () => {
      const t = (performance.now() - startedAt) / 1000;
      const fake = Math.min(1, Math.max(0, 0.35 + 0.25 * Math.sin(t * 2) + (Math.random() - 0.5) * 0.2));
      gainRef.current = gainRef.current * smoothing + fake * (1 - smoothing);
      setLevel(gainRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, [smoothing]);

  const startReal = useCallback(async () => {
    const diag = envDiagnostics();
    if (!diag.secure) {
      setError("Microphone requires a secure context (HTTPS or localhost).");
      setState("error");
      return;
    }
    if (!diag.hasGetUserMedia) {
      setError("This browser does not support getUserMedia or it is unavailable.");
      setState("error");
      return;
    }

    try {
      const perm = await getMicPermissionState();
      if (perm === "denied") {
        throw new DOMException("Microphone permission is blocked. Use the site info/lock icon to allow.", "NotAllowedError");
      }

      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;

      const win = window as WindowWithWebkitAudio;
      const Ctx = window.AudioContext ?? win.webkitAudioContext;
      if (!Ctx) throw new Error("Web Audio API is not supported in this browser.");
      const ctx = new Ctx();
      ctxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      const src = ctx.createMediaStreamSource(stream);
      sourceRef.current = src;
      src.connect(analyser);

      const buffer = new Float32Array(analyser.frequencyBinCount);
      setState("listening");

      const loop = () => {
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);
        const raw = Math.min(1, Math.max(0, rms * 4));
        gainRef.current = gainRef.current * smoothing + raw * (1 - smoothing);
        setLevel(gainRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      const err = e as { name?: string; message?: string };
      const name = err?.name ?? "Error";
      let msg = err?.message ?? String(e);
      if (name === "NotAllowedError") msg = "Microphone access was blocked. Allow the microphone, then try again.";
      else if (name === "NotFoundError") msg = "No audio input device found.";
      else if (name === "NotReadableError") msg = "Microphone is in use by another application.";
      else if (name === "SecurityError") msg = "Microphone requires HTTPS (or localhost).";
      setError(msg);
      setState(simulate ? "fallback" : "error");
      if (simulate) startSim();
    }
  }, [fftSize, smoothing, simulate, startSim]);

  const start = useCallback(async () => {
    if (simulate) return startSim();
    return startReal();
  }, [simulate, startReal, startSim]);

  return { level, state, start, stop, error } as const;
}

function MicWaveButton({
  size = 96,
  ringCount = 3,
  ringMaxScale = 1.8,
  onToggle,
  onError,
  label = "Toggle microphone",
  fallbackOnDenied = true,
}: {
  size?: number;
  ringCount?: number;
  ringMaxScale?: number;
  onToggle?: (state: MicrophoneState) => void;
  onError?: (message: string) => void;
  label?: string;
  fallbackOnDenied?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { level, state, start, stop, error } = useAudioLevel({ smoothing: 0.9, simulate: fallbackOnDenied });
  const clampedLevel = Math.min(1, Math.max(0, level));

  const mounted = useMounted();
  const secure = mounted ? envDiagnostics().secure : undefined;

  useEffect(() => { if (error) onError?.(error); }, [error, onError]);
  useEffect(() => { onToggle?.(state); }, [state, onToggle]);

  const toggle = useCallback(async () => { (state === "listening" || state === "fallback") ? stop() : await start(); }, [state, start, stop]);

  const px = useMemo(() => ({
    button: { width: size, height: size, borderRadius: size / 2 } as React.CSSProperties,
    container: { width: size * ringMaxScale * 1.8, height: size * ringMaxScale * 1.8 } as React.CSSProperties,
  }), [size, ringMaxScale]);

  const rings = Array.from({ length: ringCount }, (_, i) => i);

  return (
    <div className="inline-flex flex-col items-center gap-2 select-none">
      <div className="relative grid place-items-center" style={px.container}>
        {rings.map((i) => {
          const base = 1 + i * 0.25;
          const dynamic = 1 + clampedLevel * (ringMaxScale - 1);
          const scale = prefersReducedMotion ? base : base * dynamic;
          const alpha = Math.max(0, 0.18 - i * 0.04) * (0.4 + clampedLevel * 0.6);
          return (
            <motion.div key={i} className="absolute rounded-full border"
              style={{ width: size, height: size, borderWidth: 2, borderColor: "currentColor" }}
              animate={{ scale, opacity: alpha }} transition={{ type: "spring", stiffness: 140, damping: 18 }} />
          );
        })}

        <motion.button type="button" aria-pressed={state === "listening" || state === "fallback"} aria-label={label}
          onClick={toggle}
          className={["relative grid place-items-center","shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            state === "listening" ? "text-sky-500 bg-neutral-900 ring-sky-400" :
            state === "fallback" ? "text-amber-400 bg-neutral-900 ring-amber-400" :
            error ? "text-red-400 bg-neutral-900 ring-red-400" : "text-neutral-400 bg-neutral-900 ring-neutral-400",
            "hover:brightness-110 active:brightness-125","transition-[filter,box-shadow]","rounded-full"].join(" ")}
          style={px.button} whileTap={{ scale: 0.97 }}>
          <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm-7-3a1 1 0 1 1 2 0 5 5 0 0 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V20h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-2.07A7 7 0 0 1 5 11Z" />
          </svg>
          <motion.span aria-hidden className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            animate={{ boxShadow: `0 0 ${Math.round(24 + clampedLevel * 32)}px rgba(56, 189, 248, ${0.08 + clampedLevel * 0.24})` }}
            transition={{ type: "tween", duration: 0.12 }} />
        </motion.button>
      </div>

      <div className="text-[11px] text-neutral-300 text-center leading-tight max-w-[22rem]">
        {state === "listening" && <span>Listening… speak into your mic</span>}
        {state === "fallback" && <span>Mic denied/unavailable → showing safe visual demo. Allow mic, then click again.</span>}
        {state === "idle" && (
          <span suppressHydrationWarning>
            {secure === undefined ? "Click the mic to start." : secure ? "Click to start mic." : "Open this page via HTTPS (or http://localhost) to enable microphones."}
          </span>
        )}
        {error && <span role="alert" className="block text-red-400 mt-1">{error}</span>}
      </div>
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState<Array<{ id: number; role: "user" | "bot"; text: string }>>([
    { id: 1, role: "bot", text: "Hi! I’m your VoiceAI assistant. How can I help?" },
  ]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  const onSend = useCallback(() => {
    const t = text.trim(); if (!t) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: t }]); setText("");
    setTimeout(() => { setMessages((m) => [...m, { id: Date.now() + 1, role: "bot", text: `Echo: ${t}` }]); }, 250);
  }, [text]);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950/70 backdrop-blur p-2 sm:p-3">
      <div className="h-56 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={["inline-block px-3 py-2 rounded-xl text-sm", m.role === "user" ? "bg-sky-700/40 text-sky-50" : "bg-neutral-800 text-neutral-100"].join(" ")}>{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
        <input className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white outline-none focus:border-sky-500" placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="rounded-xl px-3 py-2 text-sm bg-sky-600 hover:bg-sky-500 active:translate-y-[1px]">Send</button>
      </form>
    </motion.div>
  );
}

function RemindersCard() {
  type Rem = { id: string; text: string; done: boolean };
  const [items, setItems] = useState<Rem[]>(() => {
    if (typeof window === "undefined") return [];
    try { const raw = localStorage.getItem("respona.reminders"); return raw ? (JSON.parse(raw) as Rem[]) : []; } catch { return []; }
  });
  const [text, setText] = useState("");
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("respona.reminders", JSON.stringify(items)); }, [items]);
  const add = () => { const t = text.trim(); if (!t) return; setItems((xs) => [{ id: String(Date.now()), text: t, done: false }, ...xs]); setText(""); };
  const toggle = (id: string) => setItems((xs) => xs.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  const remove = (id: string) => setItems((xs) => xs.filter((r) => r.id !== id));
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-3">
      <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold">Reminders</h3><span className="text-[10px] text-neutral-500">local demo</span></div>
      <form className="flex gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a reminder…" className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white outline-none focus:border-sky-500" />
        <button type="submit" className="rounded-xl px-3 py-2 text-sm bg-sky-600 hover:bg-sky-500">Add</button>
      </form>
      <ul className="space-y-2 max-h-56 overflow-auto pr-1">
        {items.length === 0 && (<li className="text-xs text-neutral-500">No reminders yet.</li>)}
        {items.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <button onClick={() => toggle(r.id)} className={["w-4 h-4 rounded border", r.done ? "bg-sky-500 border-sky-500" : "border-neutral-600"].join(" ")} aria-label={r.done ? "Mark as not done" : "Mark as done"} title="Toggle done" />
            <span className={["flex-1 text-sm", r.done ? "line-through text-neutral-500" : "text-neutral-100"].join(" ")}>{r.text}</span>
            <button onClick={() => remove(r.id)} className="text-[11px] text-neutral-400 hover:text-red-400">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomeMicChatPage() {
  const [micState, setMicState] = useState<MicrophoneState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const d = envDiagnostics();
    console.groupCollapsed("HomeMicChatPage • self-tests");
    console.table(d);
    console.assert(["idle","listening","fallback","error"].includes(micState), "micState should be a valid tag");
    console.assert(typeof chatOpen === "boolean", "chatOpen should be boolean");
    console.groupEnd();
  }, [micState, chatOpen]);

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-900/70">
        <div className="flex items-center gap-2"><div className="w-2 h-6 bg-sky-500 rounded-sm" /><span className="font-semibold tracking-wide">VoiceAI</span></div>
        <nav className="text-xs sm:text-sm text-neutral-400">{micState === "listening" ? "Mic: on" : "Mic: off"}</nav>
      </header>

      {/* Two-column layout: left sidebar (cards), right main (mic + chat) */}
      <main className="container mx-auto max-w-6xl px-4 py-8 grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR */}
        <aside className="space-y-3 md:sticky md:self-start md:top-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 overflow-hidden"><WeatherCard /></div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 overflow-hidden"><CalendarCard /></div>
          <RemindersCard />
        </aside>

        {/* RIGHT MAIN */}
        <section className="grid place-items-center gap-5">
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold">Talk to your assistant</h1>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto">Click the mic to start. Your essentials are in the left panel.</p>
          </div>

          <MicWaveButton size={96} onToggle={setMicState} onError={setError} fallbackOnDenied={true} />

          <div className="w-full max-w-2xl">
            <button className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/60 px-4 py-3 text-sm text-left flex items-center justify-between" onClick={() => setChatOpen((v) => !v)}>
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" /></svg>
                Chat (optional)
              </span>
              <motion.span initial={false} animate={{ rotate: chatOpen ? 180 : 0 }} className="inline-block">▼</motion.span>
            </button>
          </div>

          {chatOpen && <ChatPanel />}
          {error && <div className="text-xs text-red-400">{error}</div>}
        </section>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-neutral-500 border-t border-neutral-900/60">Tips: Use HTTPS (or localhost) for microphone. Use the icon next to the URL to Allow mic.</footer>
    </div>
  );
}
