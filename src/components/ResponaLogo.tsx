"use client";

import { motion } from "framer-motion";

export type ResponaLogoProps = {
  size?: number;          // px height
  animated?: boolean;     // wave animation
  className?: string;
};

export default function ResponaLogo({
  size = 28,
  animated = true,
  className,
}: ResponaLogoProps) {
  const bars = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div
      className={className}
      style={{ height: size, display: "inline-flex", alignItems: "center" }}
      aria-label="Respona logo"
      role="img"
    >
      <svg
        width={size * 1.6}
        height={size}
        viewBox="0 0 160 100"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        <path
          d="M5 50 C 25 35, 45 65, 65 50 S 105 35, 125 50 S 145 65, 155 50"
          fill="none"
          stroke="url(#rg)"
          strokeWidth="3"
          opacity="0.65"
        />

        {bars.map((i) => {
          const x = 20 + i * 20;
          const h = [18, 30, 42, 58, 42, 30, 18][i];
          const y = 50 - h / 2;

          return (
            <motion.rect
              key={i}
              x={x - 3}
              y={y}
              width="6"
              height={h}
              rx="3"
              fill="url(#rg)"
              initial={animated ? { scaleY: 0.9 } : false}
              animate={animated ? { scaleY: [0.9, 1.15, 0.9] } : undefined}
              style={{ originY: "50%" }}
              transition={
                animated
                  ? { duration: 1.6, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }
                  : undefined
              }
            />
          );
        })}
      </svg>

      <span className="select-none text-xl font-bold leading-none">Respona</span>
    </div>
  );
}
