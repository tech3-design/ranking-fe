"use client";

import { useRun } from "./run-context";
import { motion } from "framer-motion";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";

export function AnalysisOverlay() {
  const { run } = useRun();
  const progress = run?.progress ?? 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Logo — rings breathe in/out */}
      <div className="mb-10">
        <SignalorLoader size="lg" />
      </div>

      {/* Brand quotes only — no analyzing / preparing verbs */}
      <RotatingGeoFact
        intervalMs={4500}
        className="max-w-lg mx-auto -mt-2"
      />

      {/* Progress */}
      <div className="w-48 mt-10">
        <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{ backgroundColor: "#E04D00" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
