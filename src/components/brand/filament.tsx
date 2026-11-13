"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The filament — UBEE's signature.
 *
 * Above the reception desk in the Córdoba salon runs a warm LED line that
 * waves like a loose strand of hair. This is that line: an organic wave
 * with an irregular rhythm (no two crests alike), a soft halo and a
 * bright core. It draws itself once on load, or follows the scroll.
 */

const WAVES = {
  long: "M0 58 C 48 58, 78 30, 120 30 S 186 76, 236 64 S 296 18, 344 24 S 404 72, 456 60 S 524 16, 576 28 S 636 74, 694 62 S 762 26, 806 32 S 866 68, 914 58 S 972 40, 1000 44",
  soft: "M0 50 C 70 50, 110 36, 170 36 S 260 64, 330 60 S 430 34, 500 36 S 600 66, 670 62 S 780 34, 850 38 S 950 56, 1000 54",
};

type Props = {
  className?: string;
  variant?: keyof typeof WAVES;
  /** "load" draws once on mount; "scroll" ties the drawing to the scroll position. */
  mode?: "load" | "scroll";
  delay?: number;
  duration?: number;
  thickness?: number;
};

export function Filament({
  className,
  variant = "long",
  mode = "load",
  delay = 0.2,
  duration = 2.4,
  thickness = 1.6,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "end 45%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const length = useTransform(smooth, [0, 1], [0, 1]);
  const d = WAVES[variant];

  const drawn =
    reduce || mode === "scroll"
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { delay, duration, ease: [0.77, 0, 0.175, 1] as const },
            opacity: { delay, duration: 0.3 },
          },
        };
  const style = mode === "scroll" && !reduce ? { pathLength: length } : undefined;

  return (
    <div ref={ref} className={cn("pointer-events-none w-full", className)} aria-hidden>
    <svg
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      className="block size-full overflow-visible"
      fill="none"
    >
      {/* halo */}
      <motion.path
        d={d}
        stroke="var(--filament)"
        strokeWidth={thickness * 5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        strokeOpacity={0.35}
        style={{ ...style, filter: "blur(7px)" }}
        {...drawn}
      />
      {/* glow */}
      <motion.path
        d={d}
        stroke="var(--filament)"
        strokeWidth={thickness * 2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        strokeOpacity={0.6}
        style={{ ...style, filter: "blur(2px)" }}
        {...drawn}
      />
      {/* core */}
      <motion.path
        d={d}
        stroke="var(--filament-soft)"
        strokeWidth={thickness}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={style}
        {...drawn}
      />
    </svg>
    </div>
  );
}
