
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import {
  PROMPT_TRACKING_FEATURES_FOOTER_CTAS,
  PROMPT_TRACKING_FEATURES_INTRO,
  PROMPT_TRACKING_FEATURE_CELLS,
  type PromptTrackingFeatureMock,
} from "@/lib/landing-prompt-tracking-content";
import { PromptTrackingChatAnswerParts } from "@/components/landing/prompt-tracking-chat-answer-parts";
import { cn } from "@/lib/utils";

function dotClass(dot: "emerald" | "amber" | "neutral") {
  if (dot === "emerald") return "bg-emerald-500";
  if (dot === "amber") return "bg-amber-500";
  return "bg-neutral-400";
}

function alertDotClass(dot: "red" | "amber" | "emerald") {
  if (dot === "red") return "bg-red-500";
  if (dot === "amber") return "bg-amber-500";
  return "bg-emerald-500";
}

function alertBadgeClass(tone: "red" | "neutral" | "emerald") {
  if (tone === "red") return "bg-red-50 text-red-700";
  if (tone === "emerald") return "bg-emerald-50 text-emerald-800";
  return "bg-neutral-100 text-neutral-600";
}

function FeatureMock({ mock }: { mock: PromptTrackingFeatureMock }) {
  if (mock.kind === "chat") {
    return (
      <div className="mt-auto rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="space-y-3 text-[13px] leading-snug">
          <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 text-neutral-700">{mock.prompt}</div>
          <div className="ml-auto max-w-[94%] rounded-2xl rounded-br-md bg-neutral-900 px-3.5 py-2.5 text-[12px] font-medium text-neutral-100">
            <PromptTrackingChatAnswerParts parts={mock.answerParts} />
          </div>
        </div>
      </div>
    );
  }

  if (mock.kind === "library") {
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <ul className="divide-y divide-black/6 text-[12px] font-medium">
          {mock.rows.map((row) => (
            <li key={row.q} className="flex items-center gap-2 py-2.5 first:pt-1 last:pb-1">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white",
                  row.tone,
                )}
                aria-hidden
              >
                {row.tagLetter}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-neutral-900">{row.q}</div>
                <div className="truncate text-[11px] text-neutral-500">{row.meta}</div>
              </div>
              <span className="shrink-0 rounded-md border border-black/8 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                Tracked
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (mock.kind === "citationBar") {
    const rightPct = 100 - mock.leftPct;
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
          <span>{mock.leftLabel}</span>
          <span>{mock.rightLabel}</span>
        </div>
        <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-neutral-200">
          <div className="bg-[#2563eb]" style={{ width: `${mock.leftPct}%` }} />
          <div
            className="relative flex-1 bg-neutral-200"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)",
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold tabular-nums text-neutral-600">
          <span>{mock.leftPct}%</span>
          <span>{rightPct}%</span>
        </div>
        <ul className="mt-4 space-y-2 border-t border-black/6 pt-3 text-[12px] font-medium text-neutral-700">
          {mock.list.map((row) => (
            <li key={row.text} className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass(row.dot))} aria-hidden />
              {row.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (mock.kind === "scoreCard") {
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{mock.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
              {mock.score}
              <span className="text-lg font-semibold text-neutral-400">{mock.suffix}</span>
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#2563eb]/25 text-[11px] font-bold text-[#2563eb]">
            {mock.delta}
          </div>
        </div>
        <ul className="mt-4 space-y-2.5 border-t border-black/6 pt-3 text-[12px] font-medium text-neutral-700">
          {mock.bars.map((b) => (
            <li key={b.label} className="flex items-center gap-2">
              <span className={cn("h-1.5 shrink-0 rounded-full", b.widthClass, b.tone)} aria-hidden />
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (mock.kind === "alertList") {
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <ul className="divide-y divide-black/6 text-[12px] font-medium">
          {mock.items.map((item) => (
            <li key={item.title} className="flex items-start gap-2 py-2.5 first:pt-1 last:pb-1">
              <span className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", alertDotClass(item.dot))} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-neutral-900">{item.title}</div>
                <div className="mt-0.5 text-[11px] text-neutral-500">{item.meta}</div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  alertBadgeClass(item.badgeTone),
                )}
              >
                {item.badge}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (mock.kind === "competitorBars") {
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
          <span>{mock.title}</span>
          <span className="tabular-nums text-neutral-400">{mock.window}</span>
        </div>
        <div className="mt-3 space-y-3">
          {mock.rows.map((r) => (
            <div key={r.name}>
              <div className="flex justify-between text-[12px] font-semibold text-neutral-800">
                <span>{r.name}</span>
                <span className={cn("tabular-nums", r.name === "You" ? "text-[#2563eb]" : "text-neutral-600")}>
                  {r.pct}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200">
                <div className={cn("h-full rounded-full", r.barClass)} style={{ width: `${r.pctNum}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mock.kind === "engineGrid") {
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-3 gap-2">
          {mock.engines.map((e) => {
            const arrow = e.trend === "up" ? "↑" : e.trend === "down" ? "↓" : "→";
            const arrowTone =
              e.trend === "up" ? "text-emerald-600" : e.trend === "down" ? "text-rose-600" : "text-neutral-400";
            return (
              <div key={e.name} className="rounded-md border border-black/6 bg-neutral-50 p-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold text-white",
                      e.tone,
                    )}
                    aria-hidden
                  >
                    {e.initial}
                  </span>
                  <span className="truncate text-[11px] font-semibold text-neutral-800">{e.name}</span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-[15px] font-bold tabular-nums text-neutral-900">{e.coverage}%</span>
                  <span className={cn("text-[11px] font-bold", arrowTone)} aria-hidden>
                    {arrow}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-neutral-200">
                  <div className={cn("h-full rounded-full", e.tone)} style={{ width: `${e.coverage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mock.kind === "impactList") {
    const effortLabel = { S: "S", M: "M", L: "L" } as const;
    const impactBg = {
      red: "bg-rose-100 text-rose-700",
      amber: "bg-amber-100 text-amber-700",
      emerald: "bg-emerald-100 text-emerald-700",
      blue: "bg-[#2563eb]/10 text-[#2563eb]",
    } as const;
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <ul className="space-y-2 text-[12px]">
          {mock.items.map((it) => (
            <li key={it.title} className="flex items-center gap-2.5 rounded-md border border-black/6 bg-neutral-50 p-2">
              <span
                className={cn(
                  "flex h-6 w-10 shrink-0 items-center justify-center rounded text-[10px] font-bold tabular-nums",
                  impactBg[it.impactTone],
                )}
                aria-hidden
              >
                +{it.impact}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-neutral-900">{it.title}</div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      it.impactTone === "red" && "bg-rose-500",
                      it.impactTone === "amber" && "bg-amber-500",
                      it.impactTone === "emerald" && "bg-emerald-500",
                      it.impactTone === "blue" && "bg-[#2563eb]",
                    )}
                    style={{ width: `${Math.min(100, it.impact * 10)}%` }}
                  />
                </div>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-black/10 bg-white text-[10px] font-bold text-neutral-700">
                {effortLabel[it.effort]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (mock.kind === "trendingList") {
    return (
      <div className="mt-auto w-full rounded-xl border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <ul className="space-y-2 text-[12px]">
          {mock.items.map((it) => (
            <li key={it.prompt} className="flex items-center gap-2.5 rounded-md border border-black/6 bg-neutral-50 p-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  it.direction === "new"
                    ? "bg-[#2563eb]/10 text-[#2563eb]"
                    : "bg-emerald-100 text-emerald-700",
                )}
                aria-hidden
              >
                {it.direction === "new" ? "★" : "↑"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-neutral-900">{it.prompt}</div>
                <div className="truncate text-[10px] text-neutral-500">
                  {it.surface} · {it.velocity}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  it.direction === "new"
                    ? "bg-[#2563eb] text-white"
                    : "bg-emerald-600 text-white",
                )}
              >
                {it.direction === "new" ? "New" : "Rising"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

type FeaturesGridTheme = "orange" | "blue" | "emerald" | "violet";

const THEME_STYLES: Record<
  FeaturesGridTheme,
  {
    sectionBg: string;
    eyebrow: string;
    accentText: string;
    accentUnderline: string;
    cellBg: string;
    cellPreviewBg: string;
    cellPreviewBorder: string;
    cellRadius: string;
  }
> = {
  orange: {
    sectionBg: "bg-background",
    eyebrow: "text-neutral-400",
    accentText: "text-primary",
    accentUnderline: "border-primary/45",
    cellBg: "bg-white",
    cellPreviewBg: "bg-background",
    cellPreviewBorder: "border-black/10",
    cellRadius: "rounded-sm",
  },
  blue: {
    sectionBg: "bg-[#eff6ff]/40",
    eyebrow: "text-[#2563eb]/70",
    accentText: "text-[#2563eb]",
    accentUnderline: "border-[#2563eb]/45",
    cellBg: "bg-white",
    cellPreviewBg: "bg-[#eff6ff]/60",
    cellPreviewBorder: "border-[#2563eb]/15",
    cellRadius: "rounded-lg",
  },
  emerald: {
    sectionBg: "bg-emerald-50/40",
    eyebrow: "text-emerald-700/70",
    accentText: "text-emerald-700",
    accentUnderline: "border-emerald-600/45",
    cellBg: "bg-white",
    cellPreviewBg: "bg-emerald-50/60",
    cellPreviewBorder: "border-emerald-600/15",
    cellRadius: "rounded-2xl",
  },
  violet: {
    sectionBg: "bg-violet-50/40",
    eyebrow: "text-violet-700/70",
    accentText: "text-violet-700",
    accentUnderline: "border-violet-600/45",
    cellBg: "bg-white",
    cellPreviewBg: "bg-violet-50/60",
    cellPreviewBorder: "border-violet-600/15",
    cellRadius: "rounded-xl",
  },
};

function FeatureCell({
  title,
  description,
  mock,
  theme,
}: {
  title: string;
  description: string;
  mock: PromptTrackingFeatureMock;
  theme: FeaturesGridTheme;
}) {
  const t = THEME_STYLES[theme];
  return (
    <div className={cn("flex flex-col gap-8 px-6 py-12 md:px-8 md:py-16 lg:px-10", t.cellBg, t.cellRadius)}>
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{title}</h3>
        <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-accent-foreground md:text-[15px]">{description}</p>
      </div>
      <div className={cn("flex h-full w-full items-center justify-center border p-4", t.cellRadius, t.cellPreviewBg, t.cellPreviewBorder)}>
        <FeatureMock mock={mock} />
      </div>
    </div>
  );
}

/**
 * Same structural pattern as {@link LandingFeaturesGrid}: full-bleed dividers,
 * max-w-7xl intro, bg-black-10 grid with divide borders and mock UI cards.
 * Copy is driven by {@link PROMPT_TRACKING_FEATURE_CELLS} in `landing-prompt-tracking-content.ts`.
 */
type FeatureCellContent = { title: string; description: string; mock: PromptTrackingFeatureMock };
type FeaturesIntroContent = {
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  description: string;
};
type FeaturesFooterCtas = {
  primary: string;
  secondary: string;
  secondaryHref: string;
};

export function PromptTrackingFeaturesGrid({
  intro = PROMPT_TRACKING_FEATURES_INTRO,
  cells = PROMPT_TRACKING_FEATURE_CELLS,
  footerCtas = PROMPT_TRACKING_FEATURES_FOOTER_CTAS,
  headingId = "prompt-tracking-features-heading",
  theme = "orange",
}: {
  intro?: FeaturesIntroContent;
  cells?: readonly FeatureCellContent[];
  footerCtas?: FeaturesFooterCtas;
  footerCtas?: FeaturesFooterCtas;
  headingId?: string;
  theme?: FeaturesGridTheme;
}) {
  const row1 = cells.slice(0, 3);
  const row2 = cells.slice(3, 6);
  const t = THEME_STYLES[theme];

  return (
    <section className={cn("relative", t.sectionBg)} aria-labelledby={headingId}>
      <div aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />
      <div className="mx-auto max-w-7xl rounded-sm px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className={cn("text-[11px] font-medium uppercase tracking-[0.22em]", t.eyebrow)}>
          {intro.eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
        >
          {intro.titleBefore}{" "}
          <span className={cn("relative whitespace-nowrap", t.accentText)}>
            {intro.titleAccent}
            <span
              className={cn("absolute -bottom-1 left-0 right-0 border-b-2 border-dashed", t.accentUnderline)}
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          {intro.description}
        </p>
      </div>
      <div aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />
      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
          {row1.map((cell) => (
            <FeatureCell key={cell.title} title={cell.title} description={cell.description} mock={cell.mock} theme={theme} />
          ))}
        </div>

        {row2.length > 0 && (
          <>
            <div aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6" />
            <div className="grid grid-cols-1 divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-black/6">
              {row2.map((cell) => (
                <FeatureCell key={cell.title} title={cell.title} description={cell.description} mock={cell.mock} theme={theme} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-10 pt-8 lg:px-12">
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className={cn(LANDING_PRIMARY_CTA_CLASS, "h-10 px-5")}>
            <Link href="/sign-up">
              {footerCtas.primary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 border-black/15 bg-background px-5 text-sm font-semibold shadow-sm hover:bg-muted/50"
          >
            <Link href={footerCtas.secondaryHref}>
              {footerCtas.secondary}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
