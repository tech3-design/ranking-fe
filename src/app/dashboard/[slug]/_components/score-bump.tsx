"use client";

import { useRun } from "./run-context";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, TrendingUp } from "lucide-react";

export function ScoreBump() {
  const { scoreBump } = useRun();

  return (
    <AnimatePresence>
      {scoreBump != null && scoreBump > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-8 right-8 z-[90] flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-2xl"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e]/10">
            <TrendingUp className="h-6 w-6 text-[#22c55e]" />
            <Sparkle className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-400" fill="currentColor" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#22c55e]">+{scoreBump} pts</p>
            <p className="text-xs text-muted-foreground">
              Re-analysis complete — score improved since last run
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
