"use client";

import { Quote } from "lucide-react";

import { TESTIMONIALS, type Testimonial } from "@/lib/landing-testimonials-content";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

const TINT_CLASSES: Record<
  Testimonial["tint"],
  { dot: string; avatar: string; quote: string }
> = {
  orange: {
    dot: "bg-primary/15 text-primary",
    avatar: "bg-gradient-to-br from-primary to-orange-400 text-white",
    quote: "text-primary/25",
  },
  blue: {
    dot: "bg-[#2563eb]/15 text-[#2563eb]",
    avatar: "bg-gradient-to-br from-[#2563eb] to-sky-400 text-white",
    quote: "text-[#2563eb]/25",
  },
  emerald: {
    dot: "bg-emerald-700/15 text-emerald-700",
    avatar: "bg-gradient-to-br from-emerald-700 to-emerald-400 text-white",
    quote: "text-emerald-700/25",
  },
};

export function LandingTestimonials() {
  return (
    <section
      className="relative bg-background"
      aria-labelledby="landing-testimonials-heading"
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ in their words ]
        </p>
        <h2
          id="landing-testimonials-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          Teams running{" "}
          <span className="relative whitespace-nowrap text-primary">
            weekly GEO sprints
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Real outcomes from growth, content, and DTC teams shipping Signalor into their
          existing workflow — not another dashboard to babysit.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      <ScreenHR />
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const tone = TINT_CLASSES[t.tint];
  return (
    <figure className="relative flex flex-col gap-6 bg-white px-6 py-12 md:px-8 md:py-14 lg:px-10">
      <Quote
        className={cn("h-8 w-8 shrink-0", tone.quote)}
        strokeWidth={1.5}
        aria-hidden
      />
      <blockquote className="flex-1 text-[15px] font-light leading-relaxed text-foreground md:text-base">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-2 flex items-center gap-3 border-t border-black/6 pt-4">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold",
            tone.avatar,
          )}
          aria-hidden
        >
          {t.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">
            <cite className="not-italic">{t.name}</cite>
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {t.role} · {t.company}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
