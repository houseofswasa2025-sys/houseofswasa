"use client";

import { motion } from "motion/react";

export function SuccessCheck() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}
      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="#16a34a"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M4 12.5l5 5L20 7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}
