import { BookOpen, Feather, Quote } from "lucide-react";

/**
 * Signature illustration for the blog hero — three stacked "article" cards
 * fanned out at slight angles, each with a different accent and excerpt.
 * Deliberately editorial (typography + muted swatches), so it reads as
 * "reading room" rather than "product dashboard".
 */
export function BlogStackIllustration() {
  return (
    <div className="relative h-full w-full max-w-xl">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[340px] w-full sm:h-[380px]">
          {/* Back card — muted neutral */}
          <div
            className="absolute left-6 top-12 h-[260px] w-[86%] -rotate-[6deg] rounded-2xl border border-black/8 bg-neutral-50 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.15)]"
            aria-hidden
          >
            <div className="p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                <BookOpen className="h-2.5 w-2.5" /> Guides
              </span>
              <div className="mt-3 space-y-2">
                <div className="h-2 w-[70%] rounded-full bg-neutral-300" />
                <div className="h-2 w-[92%] rounded-full bg-neutral-200" />
                <div className="h-2 w-[58%] rounded-full bg-neutral-200" />
              </div>
              <div className="mt-5 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-neutral-200" />
                <div className="h-1.5 w-[88%] rounded-full bg-neutral-200" />
                <div className="h-1.5 w-[94%] rounded-full bg-neutral-200" />
                <div className="h-1.5 w-[42%] rounded-full bg-neutral-200" />
              </div>
            </div>
          </div>

          {/* Middle card — blue tint */}
          <div
            className="absolute left-4 top-6 h-[270px] w-[90%] rotate-[2deg] rounded-2xl border border-black/8 bg-white shadow-[0_14px_46px_-16px_rgba(37,99,235,0.25)]"
            aria-hidden
          >
            <div className="p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2563eb]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2563eb]">
                <Feather className="h-2.5 w-2.5" /> Research
              </span>
              <p className="mt-3 text-[13px] font-bold leading-snug text-neutral-900">
                What ChatGPT actually cites — a 500-prompt study
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-neutral-200" />
                <div className="h-1.5 w-[84%] rounded-full bg-neutral-200" />
                <div className="h-1.5 w-[92%] rounded-full bg-neutral-200" />
                <div className="h-1.5 w-[68%] rounded-full bg-neutral-200" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-neutral-200" />
                <div className="h-1.5 w-16 rounded-full bg-neutral-300" />
                <span className="ml-auto text-[10px] font-medium text-neutral-400">12 min</span>
              </div>
            </div>
          </div>

          {/* Front card — amber accent, most prominent */}
          <div
            className="absolute left-0 top-0 h-[300px] w-[94%] -rotate-[3deg] rounded-2xl border border-[#b45309]/20 bg-gradient-to-br from-amber-50 via-white to-amber-100/40 shadow-[0_20px_60px_-18px_rgba(180,83,9,0.32)]"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  <Quote className="h-2.5 w-2.5" /> Playbook
                </span>
                <span className="text-[10px] font-medium text-neutral-500">9 min</span>
              </div>
              <p className="mt-3 text-[15px] font-bold leading-snug text-neutral-900">
                How to turn AI citation gaps into your next content sprint
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-neutral-600">
                Read the citation roll-up. Pick the rival URLs worth beating. Ship the page that wins
                the citation back.
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#b45309] to-amber-400" />
                <div>
                  <p className="text-[11px] font-semibold text-neutral-800">Arkit K</p>
                  <p className="text-[10px] text-neutral-500">Signalor Studio</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#b45309]">
                  Read
                  <span className="inline-block h-1 w-3 bg-[#b45309]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
