"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function AnimatedItem({
  children,
  index,
  selected,
  onMouseEnter,
  onClick,
}: {
  children: ReactNode;
  index: number;
  selected: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Re-triggers as items enter/leave the viewport — the lively "scroll reveal".
  const inView = useInView(ref, { amount: 0.3, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.26, ease: EASE_OUT }}
      className={cn(
        "rounded-2xl transition-shadow",
        selected && "ring-2 ring-brand/60 ring-offset-2 ring-offset-base",
      )}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, selected: boolean) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  /** Max height of the scroll area (number = px). */
  maxHeight?: number | string;
}

/**
 * React Bits "AnimatedList" adapted to this project: framer-motion, Tailwind, and
 * PicksRecord's own palette. A scrollable column where each row scales/fades in as it
 * enters view, with top/bottom fade gradients that track scroll, optional keyboard
 * navigation, and a selected-row highlight.
 */
export function AnimatedList<T>({
  items,
  renderItem,
  getKey,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = false,
  className = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  maxHeight = 560,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({ top: itemBottom - containerHeight + extraMargin, behavior: "smooth" });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{ maxHeight }}
        className={cn("overflow-y-auto pr-1", !displayScrollbar && "no-scrollbar")}
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <AnimatedItem
              key={getKey ? getKey(item, index) : index}
              index={index}
              selected={selectedIndex === index}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                setSelectedIndex(index);
                onItemSelect?.(item, index);
              }}
            >
              {renderItem(item, index, selectedIndex === index)}
            </AnimatedItem>
          ))}
        </div>
      </div>

      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-base to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-base to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
}
