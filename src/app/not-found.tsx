"use client";

import Link from "next/link";
import { ArrowLeft, Home, Search } from "@/components/icons";
import LogoComp from "@/components/LogoComp";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-foreground antialiased selection:bg-orange-100 selection:text-orange-900">
      {/* ── Background grid ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* ── Header ── */}
      <header className="absolute left-0 right-0 top-0 z-10 border-b border-black/6 bg-[#f7f7f7]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <LogoComp />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-32 text-center">
        {/* Huge "Oops!" */}
        <div className="relative mb-1 select-none">
          <span
            className="block font-sans font-black leading-[0.9] tracking-tight"
            style={{
              fontSize: "clamp(72px, 15vw, 148px)",
              background:
                "linear-gradient(140deg, #c93b2f 0%, #e04a3d 35%, #f08478 65%, #e04a3d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 6px 28px rgba(224,74,61,0.28))",
            }}
          >
            Oops!
          </span>
        </div>

        {/* 404 badge */}
        <p className="mb-4 mt-4 font-mono text-[12px] font-bold uppercase tracking-[0.28em] text-foreground/55">
          404 - Page Not Found
        </p>

        {/* Divider */}
        <div className="mb-5 h-px w-16 bg-primary/30" />

        {/* Description */}
        <p className="mx-auto max-w-[400px] text-[15px] leading-relaxed text-muted-foreground">
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_14px_rgba(224,74,61,0.35)] transition hover:opacity-90 active:scale-[0.98]"
          >
            <Home className="size-4" />
            Go to homepage
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-8 py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98]"
          >
            <Search className="size-4" />
            Get started
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-[12px] text-muted-foreground">
          Want full GEO tooling?{" "}
          <Link
            href="/pricing"
            className="font-semibold text-primary underline-offset-4 transition hover:underline"
          >
            View pricing
          </Link>
        </p>
      </main>
    </div>
  );
}
