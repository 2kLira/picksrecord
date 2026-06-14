"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { EquityPoint } from "@/lib/stats";

interface EquityChartProps {
  points: EquityPoint[];
  color?: string;
  height?: number;
  className?: string;
}

const W = 800;

/** Animated cumulative-P&L curve: glowing stroke that draws in, with a gradient fill. */
export function EquityChart({ points, color = "#46e6a4", height = 220, className }: EquityChartProps) {
  const id = useId();
  const H = height;
  const padY = 16;

  if (points.length < 2) {
    return (
      <div
        className={className}
        style={{ height }}
      >
        <div className="flex h-full items-center justify-center text-sm text-faint">
          Settle a few picks to chart your edge.
        </div>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => padY + (1 - (v - min) / range) * (H - padY * 2);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
  const zeroY = y(0);
  const last = points[points.length - 1];
  const positive = last.value >= 0;
  const stroke = positive ? color : "#ff6b6b";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      width="100%"
      height={H}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* zero baseline */}
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="#2a3a4d" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />

      {/* area */}
      <motion.path
        d={areaPath}
        fill={`url(#fill-${id})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />

      {/* line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={`url(#glow-${id})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* head dot */}
      <motion.circle
        cx={x(points.length - 1)}
        cy={y(last.value)}
        r="4"
        fill={stroke}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.3, type: "spring", stiffness: 300 }}
      />
    </svg>
  );
}
