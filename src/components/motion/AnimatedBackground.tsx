"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Cinematic, "video-like" animated backdrop:
 *  - brand-tinted orbs that drift continuously (the looping motion)
 *  - parallax: each layer translates at its own rate as you scroll
 *  - a slowly panning blueprint grid
 *  - a rotating light sweep + aurora wash
 *  - everything fades/scales in on load
 *
 * Pure decoration: pointer-events-none, fixed behind content, and it
 * collapses to a calm static version under prefers-reduced-motion.
 * Colors stay PicksRecord's own mint/teal.
 */
export function AnimatedBackground() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // Parallax — different rates per layer so depth reads as you scroll.
  const yOrbA = useTransform(scrollY, [0, 1200], [0, 220]);
  const yOrbB = useTransform(scrollY, [0, 1200], [0, -180]);
  const yOrbC = useTransform(scrollY, [0, 1400], [0, 120]);
  const yGrid = useTransform(scrollY, [0, 1400], [0, 160]);
  const ySweep = useTransform(scrollY, [0, 1200], [0, -90]);

  if (reduce) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(70,230,164,0.16), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-48 -left-32 h-[34rem] w-[34rem] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(47,214,196,0.12), transparent 70%)" }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Aurora wash — slow hue/position drift across the whole field */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(70,230,164,0.10), transparent 60%)," +
            "radial-gradient(55% 45% at 85% 25%, rgba(47,214,196,0.08), transparent 60%)," +
            "radial-gradient(50% 50% at 60% 90%, rgba(70,230,164,0.06), transparent 60%)",
          backgroundSize: "180% 180%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 50%", "0% 100%", "0% 0%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Panning blueprint grid (scroll parallax + a slow continuous drift) */}
      <motion.div className="absolute inset-0" style={{ y: yGrid }}>
        <motion.div
          className="absolute -inset-x-10 -inset-y-24"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px)," +
              "linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(120% 80% at 50% 0%, #000 35%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(120% 80% at 50% 0%, #000 35%, transparent 85%)",
          }}
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{
            backgroundPositionX: ["0px", "44px"],
            backgroundPositionY: ["0px", "44px"],
            opacity: 1,
          }}
          transition={{
            backgroundPositionX: { duration: 18, repeat: Infinity, ease: "linear" },
            backgroundPositionY: { duration: 22, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1.2, ease: "easeOut" },
          }}
        />
      </motion.div>

      {/* Drifting orb A — mint, top-right */}
      <motion.div className="absolute right-[-12%] top-[-18%] h-[40rem] w-[40rem]" style={{ y: yOrbA }}>
        <motion.div
          className="h-full w-full rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(70,230,164,0.22), transparent 68%)" }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 24, 0], scale: [1, 1.08, 0.96, 1], opacity: 1 }}
          transition={{
            x: { duration: 26, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 30, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 22, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1.4, ease: "easeOut" },
          }}
        />
      </motion.div>

      {/* Drifting orb B — teal, bottom-left */}
      <motion.div className="absolute bottom-[-22%] left-[-14%] h-[44rem] w-[44rem]" style={{ y: yOrbB }}>
        <motion.div
          className="h-full w-full rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(47,214,196,0.18), transparent 70%)" }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ x: [0, -36, 28, 0], y: [0, 26, -22, 0], scale: [1, 0.94, 1.1, 1], opacity: 1 }}
          transition={{
            x: { duration: 30, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 24, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 28, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1.6, ease: "easeOut" },
          }}
        />
      </motion.div>

      {/* Drifting orb C — dim mint, center-right, deepest layer */}
      <motion.div className="absolute right-[18%] top-[38%] h-[26rem] w-[26rem]" style={{ y: yOrbC }}>
        <motion.div
          className="h-full w-full rounded-full blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(70,230,164,0.10), transparent 70%)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ x: [0, 30, -28, 0], y: [0, -20, 18, 0], opacity: 1 }}
          transition={{
            x: { duration: 34, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 28, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1.8, ease: "easeOut" },
          }}
        />
      </motion.div>

      {/* Rotating light sweep — a faint conic beam, the cinematic "scanning light" */}
      <motion.div
        className="absolute left-1/2 top-[-30%] h-[60rem] w-[60rem] -translate-x-1/2"
        style={{
          y: ySweep,
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(70,230,164,0.05) 28deg, transparent 70deg, transparent 360deg)",
          maskImage: "radial-gradient(closest-side, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(closest-side, #000 30%, transparent 75%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette to settle the edges */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 30%, transparent 55%, rgba(10,14,20,0.55) 100%)" }}
      />
    </motion.div>
  );
}
