"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import LogoComp from "@/components/LogoComp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CornerDiamonds } from "@/components/ui/intersection-diamonds";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/integration", label: "Integrations" },
      { href: "/prompt-tracking", label: "Prompt tracking" },
      { href: "/analyzer", label: "Free GEO audit" },
      { href: "/sign-up", label: "Get started" },
      { href: "#features", label: "Product tour" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "#features", label: "Agencies" },
      { href: "#features", label: "Brands" },
      { href: "#features", label: "SEO & growth teams" },
      { href: "mailto:hello@signalor.ai", label: "Contact sales", external: true },
    ],
  },
  {
    title: "Free tools",
    links: [
      { href: "/tools/url-analyzer", label: "URL analyzer" },
      { href: "/tools/llms-check", label: "LLM checker" },
      { href: "/tools/competitors-analysis", label: "Competitors analysis" },
      { href: "/tools/schema-validator", label: "Schema validator" },
    ],
  },
  {
    title: "Blog & resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/blog?category=Playbooks", label: "GEO playbooks" },
      { href: "/blog?category=AI%20visibility", label: "AI visibility guides" },
      { href: "/blog?category=Product", label: "Product changelog" },
    ],
  },
];

const SOCIAL = [
  { href: "https://twitter.com", label: "X (Twitter)", icon: Twitter },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://github.com", label: "GitHub", icon: Github },
] as const;

function FooterLinkRow({ href, label, external }: FooterLink) {
  const className = cn(
    "inline-flex items-center gap-1 text-sm font-normal text-neutral-600 transition-colors hover:text-neutral-900",
  );
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-black/6 p-1 bg-white ">
      <CornerDiamonds top />
      <div className="relative overflow-hidden border-b border-black/6 bg-linear-to-br from-[#eff6ff] via-white to-[#fafafa]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #e04a3d, #f4748f, #f3a6ce, #efd6f2, #ffffff)",
            // backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-2 ">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90">
                Get started
              </p>
              <h2 className="mt-3 font-sans text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem] xl:text-5xl">
                Turn{" "}
                <span className="inline-flex items-center gap-1.5 align-middle">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
                    AI
                  </span>
                </span>{" "}
                search into your{" "}
                <span className="whitespace-nowrap text-primary">highest-intent pipeline</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                Run a free GEO audit, track citations across models, and ship fixes that move how
                ChatGPT, Perplexity, and Gemini talk about you.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 border-black/15 bg-white/80 px-5 text-sm font-semibold shadow-sm backdrop-blur-sm hover:bg-white"
                >
                  <a href="mailto:hello@signalor.ai?subject=Demo%20request">Book a demo</a>
                </Button>
                <Button asChild className={`${LANDING_PRIMARY_CTA_CLASS} h-10 px-5`}>
                  <Link href="/sign-up">
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative min-w-0 lg:pl-2">
              <div className="relative rounded-sm border border-black/8 bg-white/90 p-2 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)] backdrop-blur-[2px] sm:p-3">
                <Image
                  src="/carousel1.png"
                  alt="Signalor dashboard showing AI visibility and GEO scores"
                  width={2000}
                  height={2000}
                  unoptimized
                  className="h-auto w-full select-none rounded-lg object-contain"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black/8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row">
            <div className="min-w-0 border-b border-black/8 bg-white px-6 py-10 sm:px-8 sm:py-12 lg:w-[min(100%,380px)] lg:max-w-md lg:shrink-0 lg:border-b-0 lg:border-r lg:border-black/8 lg:px-10 lg:py-14">
              <Link href="/" className="inline-block">
                <LogoComp compact size={32} />
              </Link>
              <p className="mt-5 max-w-xs text-sm font-normal leading-relaxed text-neutral-600">
                The AI visibility platform to monitor, score, and grow how generative search cites your
                brand.{" "}
                <a
                  href="mailto:hello@signalor.ai?subject=Careers"
                  className="font-medium text-[#2563eb] underline decoration-[#2563eb]/35 underline-offset-2 transition-colors hover:decoration-[#2563eb]"
                >
                  Join our team
                </a>
                .
              </p>
              <ul className="mt-6 flex flex-wrap items-center gap-2">
                {SOCIAL.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-black/8 bg-neutral-50 text-neutral-600 transition-colors hover:border-black/15 hover:bg-white hover:text-neutral-900"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 flex-1 bg-neutral-50">
              <div className="grid grid-cols-1 divide-y divide-black/8 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
                {FOOTER_COLUMNS.map((col) => (
                  <div key={col.title} className="min-w-0 px-6 py-10 sm:px-8 sm:py-12 lg:px-8 lg:py-14">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900">
                      {col.title}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {col.links.map((item) => (
                        <li key={item.label}>
                          <FooterLinkRow {...item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-black/8 bg-neutral-50 px-6 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <nav
                aria-label="Legal"
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-neutral-600"
              >
                <Link href="/privacy-policy" className="transition-colors hover:text-neutral-900">
                  Privacy policy
                </Link>
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
                <Link href="/terms-and-conditions" className="transition-colors hover:text-neutral-900">
                  Terms of service
                </Link>
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
                <a href="mailto:hello@signalor.ai" className="transition-colors hover:text-neutral-900">
                  Contact us
                </a>
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
                <Link href="/about" className="transition-colors hover:text-neutral-900">
                  About
                </Link>
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
                <a
                  href="mailto:hello@signalor.ai?subject=Press%20inquiry"
                  className="transition-colors hover:text-neutral-900"
                >
                  Press
                </a>
              </nav>

              <div className="flex flex-col items-start gap-2 lg:items-end">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  All systems online
                </div>
                <p className="text-[11px] leading-snug text-neutral-500">
                  © {new Date().getFullYear()} Signalor. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
