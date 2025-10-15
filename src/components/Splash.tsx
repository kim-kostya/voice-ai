"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import ResponaLogo from "./ResponaLogo";

type Props = { onDone: () => void; durationMs?: number };

export default function Splash({ onDone, durationMs = 2000 }: Props) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, prefersReduced ? 200 : durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs, prefersReduced]);

  if (prefersReduced) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black text-white">
        <ResponaLogo size={40} animated={false} />
        <span className="mt-2 text-gray-300">Find your voice</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <ResponaLogo size={44} animated />
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-gray-400"
        >
          Find your voice
        </motion.span>
      </motion.div>
    </div>
  );
}
