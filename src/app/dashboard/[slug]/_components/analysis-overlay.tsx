"use client";

import { useEffect, useState } from "react";
import { useRun } from "./run-context";
import { motion, AnimatePresence } from "framer-motion";
import { SignalorLoader } from "@/components/ui/signalor-loader";

const WORDS = [
  "Analyzing",
  "Crawling",
  "Preparing",
  "Scanning",
  "Evaluating",
  "Computing",
  "Visualizing",
  "Scoring",
  "Optimizing",
  "Thinking",
];

export function AnalysisOverlay() {
  const { run } = useRun();
  const [wordIndex, setWordIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const progress = run?.progress ?? 0;

  useEffect(() => {
    const t = setInterval(() => {
      setDotCount((d) => {
        if (d >= 3) {
          setWordIndex((i) => (i + 1) % WORDS.length);
          return 0;
        }
        return d + 1;
      });
    }, 800);
    return () => clearInterval(t);
  }, []);

  const dots = ".".repeat(dotCount);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Logo — rings breathe in/out */}
      <div className="mb-14">
        <SignalorLoader size="lg" />
      </div>

      {/* Slow word + dots */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={wordIndex}
            initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-base text-muted-foreground font-medium tracking-wide"
          >
            {WORDS[wordIndex]}<span className="inline-block w-6 text-left">{dots}</span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="w-48 mt-10">
        <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{ backgroundColor: "#F95C4B" }}
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
