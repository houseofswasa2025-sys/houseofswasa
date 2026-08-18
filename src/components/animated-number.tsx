"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent, motion } from "motion/react";

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, motionValue]);

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (ref.current) ref.current.textContent = Math.round(latest).toString();
  });

  return (
    <motion.span ref={ref} className={className}>
      0
    </motion.span>
  );
}
