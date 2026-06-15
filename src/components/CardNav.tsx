"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { cn } from "@/lib/utils";

export interface CardNavLink {
  label: string;
  href: string;
  ariaLabel?: string;
}
export interface CardNavItem {
  label: string;
  links: CardNavLink[];
}

interface CardNavProps {
  items: CardNavItem[];
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * React Bits "CardNav" — a top bar that expands into link cards — reimplemented with
 * framer-motion (no gsap) and the project's palette. Keeps your design: slate surfaces,
 * mint accents, sharp 2px CTA.
 */
export function CardNav({ items, ctaLabel, ctaHref, className = "" }: CardNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative z-50 mx-auto w-full max-w-3xl px-4", className)}>
      <nav className="relative overflow-hidden rounded-xl border border-hair bg-surface shadow-[var(--shadow-card)]">
        {/* Top bar */}
        <div className="relative flex h-[60px] items-center justify-between pl-4 pr-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-full flex-col items-center justify-center gap-[6px] px-2 text-fg"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="block h-[2px] w-[26px] bg-current"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="block h-[2px] w-[26px] bg-current"
            />
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo />
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href={ctaHref}
              className="hidden h-9 items-center rounded-[2px] bg-brand px-4 text-sm font-semibold text-base transition hover:brightness-110 active:scale-[0.98] sm:inline-flex"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        {/* Expanding link cards */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <motion.div
                initial="closed"
                animate="open"
                variants={{ open: { transition: { staggerChildren: 0.08 } } }}
                className="grid gap-2 p-2 sm:grid-cols-3"
              >
                {items.slice(0, 3).map((item) => (
                  <motion.div
                    key={item.label}
                    variants={{
                      closed: { y: 30, opacity: 0 },
                      open: { y: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
                    }}
                    className="flex min-h-[140px] flex-col justify-between rounded-lg border border-hair bg-base-2 p-4"
                  >
                    <div className="text-lg font-medium text-fg">{item.label}</div>
                    <div className="mt-auto flex flex-col gap-1">
                      {item.links.map((lnk) => (
                        <Link
                          key={lnk.label}
                          href={lnk.href}
                          aria-label={lnk.ariaLabel ?? lnk.label}
                          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-brand"
                        >
                          <ArrowUpRight size={15} className="text-brand" />
                          {lnk.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
