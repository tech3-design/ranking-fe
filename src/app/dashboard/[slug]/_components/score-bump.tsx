"use client";

import { useRun } from "./run-context";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";

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
          className="fixed bottom-8 right-8 z-[90] flex items-center gap-3 rounded-2xl bg-card border border-border px-5 py-4 shadow-2xl"
        >
          <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#22c55e]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#22c55e]">+{scoreBump} pts</p>
            <p className="text-xs text-muted-foreground">Score improved since last analysis</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
