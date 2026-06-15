"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * React Bits "Dock" magnification, adapted to a *vertical* sidebar with framer-motion
 * and the project's palette. Items grow as the cursor approaches (by Y proximity) and
 * reveal a label to the side. Supports a top group + a bottom-pinned group, and a few
 * item variants (nav / brand action / logo / avatar) so the whole sidebar can live here.
 */

export type DockVariant = "default" | "brand" | "logo" | "avatar";

export interface DockNavItem {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  variant?: DockVariant;
}

const SPRING: SpringOptions = { mass: 0.1, stiffness: 150, damping: 12 };

function itemLook(item: DockNavItem) {
  switch (item.variant) {
    case "brand":
      return "border-transparent bg-brand text-base";
    case "logo":
      return "border-hair bg-elevated text-brand";
    case "avatar":
      return "border-hair bg-elevated text-brand font-mono text-xs font-semibold";
    default:
      return item.active
        ? "border-brand/30 bg-brand/10 text-brand"
        : "border-hair bg-elevated text-muted hover:text-fg";
  }
}

function DockItem({
  item,
  mouseY,
  distance,
  baseItemSize,
  magnification,
}: {
  item: DockNavItem;
  mouseY: MotionValue<number>;
  distance: number;
  baseItemSize: number;
  magnification: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseDistance = useTransform(mouseY, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { y: 0, height: baseItemSize };
    return val - rect.y - baseItemSize / 2;
  });
  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, SPRING);
  const round = item.variant === "avatar" ? "rounded-full" : "rounded-xl";

  return (
    <motion.div style={{ width: size, height: size }} className="relative">
      <Link
        ref={ref}
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={item.label}
        className={cn(
          "flex h-full w-full items-center justify-center border transition-colors",
          round,
          itemLook(item),
        )}
      >
        <span className="grid h-full w-full place-items-center [&_svg]:h-[42%] [&_svg]:w-[42%]">{item.icon}</span>
      </Link>

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            role="tooltip"
            className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-hair bg-surface px-2 py-1 text-xs font-medium text-fg shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)]"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Dock({
  items,
  bottomItems = [],
  className = "",
  distance = 170,
  baseItemSize = 48,
  magnification = 68,
}: {
  items: DockNavItem[];
  bottomItems?: DockNavItem[];
  className?: string;
  distance?: number;
  baseItemSize?: number;
  magnification?: number;
}) {
  const mouseY = useMotionValue(Infinity);

  const render = (item: DockNavItem) => (
    <DockItem
      key={item.href + item.label}
      item={item}
      mouseY={mouseY}
      distance={distance}
      baseItemSize={baseItemSize}
      magnification={magnification}
    />
  );

  return (
    <div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "flex w-fit flex-col items-center gap-3 rounded-2xl border border-hair bg-base-2/60 p-2",
        className,
      )}
      role="toolbar"
      aria-label="Sidebar navigation"
    >
      <div className="flex flex-col items-center gap-3">{items.map(render)}</div>
      {bottomItems.length > 0 && (
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-hair pt-3">
          {bottomItems.map(render)}
        </div>
      )}
    </div>
  );
}
