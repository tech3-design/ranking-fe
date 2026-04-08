"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { ArrowRight, ArrowLeft, Globe, MapPin, Sparkles } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";

const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function HeroAnalyzerForm() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = URL, 1 = country, 2 = analyzing
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function goNext() {
    if (step === 0 && !url.trim()) return;
    setDir(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDir(-1);
    setStep((s) => s - 1);
  }

  async function handleAnalyze() {
    const normalizedUrl = url.startsWith("http://") || url.startsWith("https://")
      ? url.trim()
      : `https://${url.trim()}`;

    setError("");
    setLoading(true);
    setDir(1);
    setStep(2);

    try {
      const run = await startAnalysis({
        url: normalizedUrl,
        run_type: "full_site",
        country,
      });
      router.push(routes.analyzerResults(run.id));
    } catch {
      setError("Analysis failed. Please verify the URL and try again.");
      setLoading(false);
      setDir(-1);
      setStep(1);
    }
  }

  return (
    <div className="w-full max-w-xl mt-8">
      <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-1.5 shadow-lg overflow-hidden">
        <div className="relative min-h-[64px] data-[loading=1]:min-h-[168px]" data-loading={step === 2 ? 1 : 0}>
          <AnimatePresence mode="wait" custom={dir}>
            {/* STEP 0: URL Input */}
            {step === 0 && (
              <motion.div
                key="url"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your website URL..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && url.trim() && goNext()}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!url.trim()}
                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition hover:bg-primary/90 active:scale-95 disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* STEP 1: Country Select */}
            {step === 1 && (
              <motion.div
                key="country"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-2 px-4 py-2"
              >
                <button
                  type="button"
                  onClick={goBack}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none py-2 cursor-pointer"
                  autoFocus
                >
                  {COUNTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition hover:bg-primary/90 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze
                </button>
              </motion.div>
            )}

            {/* STEP 2: Analyzing — coral rings + GEO/SEO facts (same family as dashboard overlay) */}
            {step === 2 && (
              <motion.div
                key="loading"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col items-center justify-center gap-3 px-4 py-4 w-full"
              >
                <SignalorLoader size="sm" />
                <RotatingGeoFact intervalMs={4500} size="xs" className="min-h-9 w-full max-w-md" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: step === s ? 24 : 8,
              backgroundColor: step >= s ? "#F95C4B" : "var(--border)",
            }}
          />
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
