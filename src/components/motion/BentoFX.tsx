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
    if (reduce) return;
    // Touch devices have no cursor: skip spotlight/tilt/magnetism and instead
    // trigger glow + particles + ripple on tap (see the coarse-pointer branch below).
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const proximity = SPOTLIGHT_RADIUS * 0.5;
    const fadeDistance = SPOTLIGHT_RADIUS * 0.75;

    let raf = 0;
    let tiltedCard: HTMLElement | null = null;
    let particleCard: HTMLElement | null = null;

    const clearParticlesOf = (card: HTMLElement | null) => {
      card?.querySelectorAll(".bento-particle").forEach((p) => p.remove());
    };
    const clearParticles = () => {
      clearParticlesOf(particleCard);
      particleCard = null;
    };

    const ripple = (card: HTMLElement, x: number, y: number) => {
      const rect = card.getBoundingClientRect();
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const el = document.createElement("div");
      el.className = "bento-ripple";
      el.style.width = `${maxDistance * 2}px`;
      el.style.height = `${maxDistance * 2}px`;
      el.style.left = `${x - maxDistance}px`;
      el.style.top = `${y - maxDistance}px`;
      card.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
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

    // ── Touch equivalent: no cursor, so light up the tapped card on touchstart ──
    if (coarse) {
      const onTouch = (e: TouchEvent) => {
        const touch = e.touches[0] ?? e.changedTouches[0];
        if (!touch) return;
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const card = el instanceof Element ? (el.closest(".card") as HTMLElement | null) : null;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        card.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`);
        card.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`);
        card.style.setProperty("--glow-intensity", "1");
        clearParticlesOf(card);
        spawnParticles(card);
        ripple(card, x, y);
        window.setTimeout(() => card.style.setProperty("--glow-intensity", "0"), 650);
        window.setTimeout(() => clearParticlesOf(card), 1300);
      };
      document.addEventListener("touchstart", onTouch, { passive: true });
      return () => document.removeEventListener("touchstart", onTouch);
    }

    // ── Fine pointer (mouse): cursor spotlight + glow + tilt/magnetism ──
    const spotlight = document.createElement("div");
    spotlight.className = "bento-spotlight";
    document.body.appendChild(spotlight);

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
      ripple(card, e.clientX - rect.left, e.clientY - rect.top);
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
