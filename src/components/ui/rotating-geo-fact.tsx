"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRotatingGeoFactIndex } from "@/lib/geo-loading-facts";

type RotatingGeoFactProps = {
  /** ms between fact changes */
  intervalMs?: number;
  className?: string;
  /** text-sm | text-xs for compact slots */
  size?: "sm" | "xs";
};

export function RotatingGeoFact({
  intervalMs = 4200,
  className = "",
  size = "sm",
}: RotatingGeoFactProps) {
  const { index, facts } = useRotatingGeoFactIndex(intervalMs);
  const textClass = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div
      className={`min-h-[2.75rem] flex items-center justify-center ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`${textClass} text-muted-foreground text-center leading-snug max-w-md px-4`}
        >
          {facts[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
