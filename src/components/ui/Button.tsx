"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Brand mint — flat saturated fill (AuthKit style), dark text for legibility.
  primary: "bg-brand text-base hover:brightness-110",
  secondary: "bg-elevated text-fg hairline hover:bg-hair-strong",
  // Ghost — transparent with a faint inset hairline, no added luminance.
  outline: "text-fg hairline-faint hover:[box-shadow:var(--shadow-hairline)]",
  ghost: "text-muted hover:text-fg hover:bg-surface/60",
  danger: "bg-lost/10 text-lost hairline-faint hover:bg-lost/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-4 text-body gap-2",
  lg: "h-12 px-5 text-body gap-2",
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        // Sharp 2px corners keep the utility rhythm — never pill-shaped actions.
        "inline-flex items-center justify-center rounded-[2px] font-medium",
        "transition disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
