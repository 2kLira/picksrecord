"use client";

import { useEffect } from "react";

/**
 * Site-wide "MagicBento" effects (React Bits) reimplemented without gsap and recolored
 * to the project's mint. Applies to every `.card` surface:
 *  - a cursor-following spotlight
 *  - per-card border glow that tracks proximity (via --glow-* CSS vars)
 *  - particles + a click ripple on the hovered card
 *  - subtle 3D tilt + magnetism (skipped on cards marked [data-no-tilt],
 *    i.e. framer-motion cards, to avoid transform conflicts)
 *
 * Disabled on touch/small screens and under prefers-reduced-motion.
 */

const SPOTLIGHT_RADIUS = 320;
const PARTICLE_COUNT = 12;

export function BentoFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (reduce || isMobile) return;

    const proximity = SPOTLIGHT_RADIUS * 0.5;
    const fadeDistance = SPOTLIGHT_RADIUS * 0.75;

    const spotlight = document.createElement("div");
    spotlight.className = "bento-spotlight";
    document.body.appendChild(spotlight);

    let raf = 0;
    let tiltedCard: HTMLElement | null = null;
    let particleCard: HTMLElement | null = null;

    const clearParticles = () => {
      if (!particleCard) return;
      particleCard.querySelectorAll(".bento-particle").forEach((p) => p.remove());
      particleCard = null;
    };

    const spawnParticles = (card: HTMLElement) => {
      const { width, height } = card.getBoundingClientRect();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement("div");
        p.className = "bento-particle";
        p.style.left = `${Math.random() * width}px`;
        p.style.top = `${Math.random() * height}px`;
        p.style.setProperty("--pdx", `${(Math.random() - 0.5) * 70}px`);
        p.style.setProperty("--pdy", `${(Math.random() - 0.5) * 70}px`);
        p.style.animationDelay = `${Math.random() * 1.5}s`;
        card.appendChild(p);
      }
      particleCard = card;
    };

    const resetTilt = (card: HTMLElement) => {
      card.style.transform = "";
    };

    const update = (mx: number, my: number, target: EventTarget | null) => {
      spotlight.style.left = `${mx}px`;
      spotlight.style.top = `${my}px`;

      const cards = document.querySelectorAll<HTMLElement>(".card");
      let minDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(mx - cx, my - cy) - Math.max(rect.width, rect.height) / 2;
        const eff = Math.max(0, distance);
        minDistance = Math.min(minDistance, eff);

        let intensity = 0;
        if (eff <= proximity) intensity = 1;
        else if (eff <= fadeDistance) intensity = (fadeDistance - eff) / (fadeDistance - proximity);

        const relX = ((mx - rect.left) / rect.width) * 100;
        const relY = ((my - rect.top) / rect.height) * 100;
        card.style.setProperty("--glow-x", `${relX}%`);
        card.style.setProperty("--glow-y", `${relY}%`);
        card.style.setProperty("--glow-intensity", intensity.toString());
      });

      spotlight.style.opacity =
        minDistance <= proximity
          ? "0.8"
          : minDistance <= fadeDistance
            ? `${((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8}`
            : "0";

      // Tilt + magnetism on the hovered card (unless opted out).
      const hovered =
        target instanceof Element ? (target.closest(".card") as HTMLElement | null) : null;

      if (tiltedCard && tiltedCard !== hovered) resetTilt(tiltedCard);
      if (particleCard && particleCard !== hovered) clearParticles();

      if (hovered) {
        if (particleCard !== hovered) spawnParticles(hovered);
        if (!hovered.hasAttribute("data-no-tilt")) {
          const rect = hovered.getBoundingClientRect();
          const x = mx - rect.left;
          const y = my - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rotateX = ((y - cy) / cy) * -7;
          const rotateY = ((x - cx) / cx) * 7;
          const magX = (x - cx) * 0.04;
          const magY = (y - cy) * 0.04;
          hovered.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${magX}px, ${magY}px)`;
          tiltedCard = hovered;
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      const { clientX, clientY, target } = e;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => update(clientX, clientY, target));
    };

    const onLeaveWindow = () => {
      spotlight.style.opacity = "0";
      if (tiltedCard) resetTilt(tiltedCard);
      clearParticles();
      document.querySelectorAll<HTMLElement>(".card").forEach((c) => c.style.setProperty("--glow-intensity", "0"));
    };

    const onClick = (e: MouseEvent) => {
      const card = e.target instanceof Element ? (e.target.closest(".card") as HTMLElement | null) : null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement("div");
      ripple.className = "bento-ripple";
      ripple.style.width = `${maxDistance * 2}px`;
      ripple.style.height = `${maxDistance * 2}px`;
      ripple.style.left = `${x - maxDistance}px`;
      ripple.style.top = `${y - maxDistance}px`;
      card.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick);
    document.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mouseleave", onLeaveWindow);
      if (tiltedCard) resetTilt(tiltedCard);
      clearParticles();
      spotlight.remove();
    };
  }, []);

  return null;
}
