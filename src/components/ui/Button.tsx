"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand to-brand-2 text-base font-semibold shadow-[0_8px_30px_-10px_rgba(70,230,164,0.6)] hover:brightness-110",
  secondary: "bg-elevated text-fg hover:bg-hair-strong border border-hair",
  outline: "border border-hair-strong text-fg hover:bg-surface hover:border-brand/50",
  ghost: "text-muted hover:text-fg hover:bg-surface",
  danger: "bg-lost/10 text-lost border border-lost/30 hover:bg-lost/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium tracking-tight",
        "transition-colors disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
