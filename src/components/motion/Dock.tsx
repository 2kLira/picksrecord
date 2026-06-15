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
 * React Bits "Dock" magnification, adapted with framer-motion and the project's palette.
 * Works vertically (desktop sidebar) or horizontally (mobile bottom bar). Driven by
 * pointer events, so it magnifies under a mouse on desktop and under a dragging finger
 * on touch. Items grow with proximity and reveal a label; supports variants (nav / brand
 * action / logo / avatar) and a bottom-pinned group (vertical only).
 */

export type DockVariant = "default" | "brand" | "logo" | "avatar";
export type DockOrientation = "vertical" | "horizontal";

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
  pos,
  orientation,
  distance,
  baseItemSize,
  magnification,
}: {
  item: DockNavItem;
  pos: MotionValue<number>;
  orientation: DockOrientation;
  distance: number;
  baseItemSize: number;
  magnification: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseDistance = useTransform(pos, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return distance + 1;
    const start = orientation === "vertical" ? rect.y : rect.x;
    return val - start - baseItemSize / 2;
  });
  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, SPRING);
  const round = item.variant === "avatar" ? "rounded-full" : "rounded-xl";

  const tooltipPos =
    orientation === "vertical"
      ? "left-full top-1/2 ml-3 -translate-y-1/2"
      : "bottom-full left-1/2 mb-3 -translate-x-1/2";

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            role="tooltip"
            className={cn(
              "pointer-events-none absolute z-20 whitespace-nowrap rounded-md border border-hair bg-surface px-2 py-1 text-xs font-medium text-fg shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)]",
              tooltipPos,
            )}
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
  orientation = "vertical",
  className = "",
  distance = 170,
  baseItemSize = 48,
  magnification = 68,
}: {
  items: DockNavItem[];
  bottomItems?: DockNavItem[];
  orientation?: DockOrientation;
  className?: string;
  distance?: number;
  baseItemSize?: number;
  magnification?: number;
}) {
  const pos = useMotionValue(Infinity);
  const vertical = orientation === "vertical";

  const render = (item: DockNavItem) => (
    <DockItem
      key={item.href + item.label}
      item={item}
      pos={pos}
      orientation={orientation}
      distance={distance}
      baseItemSize={baseItemSize}
      magnification={magnification}
    />
  );

  return (
    <div
      onPointerMove={(e) => pos.set(vertical ? e.clientY : e.clientX)}
      onPointerLeave={() => pos.set(Infinity)}
      onPointerUp={() => pos.set(Infinity)}
      onPointerCancel={() => pos.set(Infinity)}
      // Fixed cross-axis size + start alignment so magnified items overflow (stick out)
      // toward the content instead of just widening the whole panel.
      style={vertical ? { width: baseItemSize + 16 } : { height: baseItemSize + 16 }}
      className={cn(
        "flex gap-3 rounded-2xl border border-hair bg-base-2/60 p-2",
        vertical ? "flex-col items-start" : "flex-row items-end",
        className,
      )}
      role="toolbar"
      aria-label="Navigation dock"
    >
      <div className={cn("flex gap-3", vertical ? "flex-col items-start" : "flex-row items-end")}>
        {items.map(render)}
      </div>
      {bottomItems.length > 0 && (
        <div className={cn("flex gap-3", vertical ? "mt-auto flex-col items-start" : "flex-row items-end")}>
          {bottomItems.map(render)}
        </div>
      )}
    </div>
  );
}
