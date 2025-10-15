"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Splash from "./Splash";
import type { ReactNode } from "react";

const STORAGE_KEY = "respona_saw_splash";

export default function SplashGate({ children }: { children: ReactNode }) {
  // initialize from sessionStorage to avoid first-frame flash
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY)) {
      setShowSplash(false);
    }
  }, []);

  const handleDone = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Splash onDone={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* app fades in after splash */}
      <motion.div
        key="app"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: showSplash ? 0 : 1, scale: showSplash ? 0.98 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
