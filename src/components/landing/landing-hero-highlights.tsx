"use client";

import Image from "next/image";
import { BarChart3, FileText, LayoutGrid, LineChart, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: BarChart3, label: "AI visibility" },
  { icon: FileText, label: "Prompt tracking" },
  { icon: LayoutGrid, label: "Content signals" },
  { icon: LineChart, label: "Off-site citations" },
  { icon: Users, label: "Agent analytics" },
] as const;

export function LandingHeroHighlights() {
  return (
    <>
      <div
        aria-hidden
        className="relative left-1/2 z-10 mt-14 w-screen -translate-x-1/2 border-t border-black/6 lg:mt-20"
      />
      <nav
        aria-label="Product highlights"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-2.5 px-4 py-8 sm:gap-3 lg:px-10"
      >
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-neutral-50/95 px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          >
            <Icon className="h-[18px] w-[18px] shrink-0 text-neutral-500" strokeWidth={1.75} aria-hidden />
            <span className="capitalize">{label}</span>
          </div>
        ))}
      </nav>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-2 pt-2 sm:pb-4 lg:px-10">
        <Image
          src="/carousel1.png"
          alt="Signalor dashboard preview"
          width={2000}
          height={2000}
          unoptimized
          className="mx-auto h-auto w-full max-w-4xl select-none rounded-xl border border-black/[0.07] bg-white object-contain shadow-[0_22px_56px_-14px_rgba(15,23,42,0.18)] sm:max-w-5xl"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
          priority
        />
      </div>
    </>
  );
}
