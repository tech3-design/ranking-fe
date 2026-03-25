"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { ArrowRight, Globe, Loader2 } from "lucide-react"; // Optional: if you use lucide-react, otherwise replace with SVGs

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

export function HeroAnalyzerForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    const normalizedUrl = url.startsWith("http://") || url.startsWith("https://")
      ? url.trim()
      : `https://${url.trim()}`;

    setError("");
    setLoading(true);
    try {
      const run = await startAnalysis({
        url: normalizedUrl,
        run_type: "full_site",
        country,
      });
      router.push(routes.analyzerResults(run.id));
    } catch {
      setError("Analysis failed to start. Please verify the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      {/* Search Bar Container */}
      <div className="group relative flex flex-col rounded-2xl bg-card p-1.5 shadow-sm ring-1 ring-border transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 hover:shadow-md md:flex-row md:items-center md:rounded-full md:p-2">
        
        {/* URL Input */}
        <div className=" relative flex flex-1 items-center px-4 py-2 md:py-0">
          <Globe className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Enter website URL (e.g., yourbrand.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus:outline-none"
            required
          />
        </div>

        {/* Divider (Desktop Only) */}
        <div className="hidden h-8 w-[1px] bg-border md:block" />

        {/* Country Select */}
        <div className="flex w-full items-center border-t border-border px-4 py-2 md:w-auto md:border-t-0 md:py-0">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full cursor-pointer appearance-none bg-transparent py-2 pl-2 pr-8 text-sm text-slate-600 focus:outline-none focus:ring-0 md:w-[140px]"
            required
          >
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {/* Custom Dropdown Arrow */}
          <div className="pointer-events-none absolute right-6 md:right-40">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="gradient-btn mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium transition-transform active:scale-95 disabled:opacity-70 md:mt-0 md:w-auto md:rounded-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </form>
  );
}