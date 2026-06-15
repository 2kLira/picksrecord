"use client";

import { type CSSProperties, useEffect } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";

/**
 * React Bits "Counter" — odometer-style rolling digits, adapted to framer-motion
 * and the project's tokens (colors inherit from the parent so it matches your design).
 */

function Digit({
  place,
  value,
  height,
  digitStyle,
}: {
  place: number | ".";
  value: number;
  height: number;
  digitStyle?: CSSProperties;
}) {
  const isDecimal = place === ".";
  const valueRoundedToPlace = isDecimal ? 0 : Math.floor(value / (place as number));
  const animatedValue = useSpring(valueRoundedToPlace, { mass: 0.2, stiffness: 140, damping: 18 });

  useEffect(() => {
    if (!isDecimal) animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace, isDecimal]);

  if (isDecimal) {
    return (
      <span
        style={{ height, width: "fit-content", position: "relative", fontVariantNumeric: "tabular-nums", ...digitStyle }}
      >
        .
      </span>
    );
  }

  return (
    <span
      style={{ height, width: "1ch", position: "relative", fontVariantNumeric: "tabular-nums", ...digitStyle }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <Num key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

function Num({ mv, number, height }: { mv: MotionValue<number>; number: number; height: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) memo -= 10 * height;
    return memo;
  });
  return (
    <motion.span
      style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", y }}
    >
      {number}
    </motion.span>
  );
}

function defaultPlaces(value: number): (number | ".")[] {
  const chars = [...Math.trunc(Math.abs(value)).toString()];
  return chars.map((_, i) => 10 ** (chars.length - i - 1));
}

interface CounterProps {
  value: number;
  fontSize?: number;
  padding?: number;
  places?: (number | ".")[];
  gap?: number;
  textColor?: string;
  fontWeight?: CSSProperties["fontWeight"];
  containerStyle?: CSSProperties;
  counterStyle?: CSSProperties;
  digitStyle?: CSSProperties;
}

export function Counter({
  value,
  fontSize = 30,
  padding = 0,
  places,
  gap = 2,
  textColor = "inherit",
  fontWeight = "inherit",
  containerStyle,
  counterStyle,
  digitStyle,
}: CounterProps) {
  const height = fontSize + padding;
  const resolvedPlaces = places ?? defaultPlaces(value);

  return (
    <span style={{ position: "relative", display: "inline-block", ...containerStyle }}>
      <span
        style={{
          display: "flex",
          gap,
          overflow: "hidden",
          lineHeight: 1,
          fontSize,
          color: textColor,
          fontWeight,
          ...counterStyle,
        }}
      >
        {resolvedPlaces.map((place, i) => (
          <Digit key={i} place={place} value={Math.trunc(Math.abs(value))} height={height} digitStyle={digitStyle} />
        ))}
      </span>
    </span>
  );
}
