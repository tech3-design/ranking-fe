"use client";

import React, { useEffect, useRef, useState } from "react";
import { Globe, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANDING_COUNTRY_OPTIONS, LANDING_PRIMARY_CTA_CLASS } from "./constants";

/** Landing URL + country + CTA (same behavior as previous inline `page.tsx` export). */
export function HeroAnalyzerForm() {
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState<(typeof LANDING_COUNTRY_OPTIONS)[number]["name"]>(
    "United States",
  );
  const [countryOpen, setCountryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const countryWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (
        countryWrapRef.current &&
        !countryWrapRef.current.contains(e.target as Node)
      ) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const selected =
    LANDING_COUNTRY_OPTIONS.find((o) => o.name === country) ?? LANDING_COUNTRY_OPTIONS[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setError("");
    setLoading(true);
    try {
      setTimeout(() => setLoading(false), 2000);
    } catch {
      setError("Analysis failed to start. Please verify the URL and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 mt-8 flex w-full max-w-2xl flex-col items-start">
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={cn(
            "group flex flex-col overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/3 transition-[box-shadow,border-color] duration-200",
            "focus-within:border-[#e04a3d]/35 focus-within:shadow-[0_4px_20px_rgba(224,74,61,0.12)] focus-within:ring-[#e04a3d]/10",
            "md:flex-row md:items-stretch md:p-0",
          )}
        >
          <div className="relative flex min-h-11 flex-1 items-center gap-0.5 px-3 py-2.5 md:px-4 md:py-0">
            <Globe
              className="h-[18px] w-[18px] shrink-0 text-neutral-400"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="text"
              placeholder="https://yoursite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 text-[14px] font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              required
              autoComplete="url"
              inputMode="url"
            />
          </div>

          <div className="hidden w-px shrink-0 self-stretch bg-black/8 md:block" />

          <div
            ref={countryWrapRef}
            className="relative min-w-0 border-t border-black/10 md:w-[200px] md:shrink-0 md:border-t-0 md:border-l md:border-black/8"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left md:h-full md:py-2 md:pl-3 md:pr-2"
              aria-expanded={countryOpen}
              aria-haspopup="listbox"
              onClick={() => setCountryOpen((o) => !o)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none" aria-hidden>
                  {selected.flag}
                </span>
                <span className="truncate text-[14px] font-medium text-neutral-900">
                  {selected.name}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-neutral-400 transition-transform",
                  countryOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {countryOpen && (
              <ul
                className="absolute left-0 right-0 top-full z-60 mt-1 max-h-56 overflow-auto rounded-md border border-black/10 bg-white py-1 shadow-lg ring-1 ring-black/5"
                role="listbox"
              >
                {LANDING_COUNTRY_OPTIONS.map((opt) => (
                  <li key={opt.code} role="option" aria-selected={opt.name === country}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] font-medium text-neutral-800 hover:bg-neutral-50",
                        opt.name === country && "bg-neutral-50",
                      )}
                      onClick={() => {
                        setCountry(opt.name);
                        setCountryOpen(false);
                      }}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {opt.flag}
                      </span>
                      <span>{opt.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-1.5 pt-0 md:flex md:items-stretch md:border-l md:border-black/8 md:p-1.5 md:pl-1.5">
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className={cn(
                LANDING_PRIMARY_CTA_CLASS,
                "h-10 w-full min-w-[140px] px-6 md:w-auto",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  <span>Scanning</span>
                </>
              ) : (
                <>
                  <span>Analyze free</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="mt-3 text-left text-[12px] font-medium leading-relaxed text-neutral-500">
          No sign-up required · Results in under 60 seconds · Free for any website
        </p>

        {error && (
          <div className="mt-4 flex items-center justify-start gap-2 rounded-md border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
