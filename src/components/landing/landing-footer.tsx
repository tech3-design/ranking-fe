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
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 sm:h-8 sm:w-8">
                    <svg viewBox="0 0 1080 1080" className="h-[18px] w-[18px] sm:h-5 sm:w-5" aria-hidden>
                      <path d="M565.79,201.17c43.67-3.79,81.17,9.26,114.46,37.06,72.34,60.41,69.67,134.55,104.91,214.09,45.59,102.92,157.65,196.05,41.43,299.84-44.78,39.99-108.24,55.11-162.85,76.4-85,33.15-130.62,64.56-228.66,44.72-279.35-56.53-309.76-455.82-77.76-594.82,46.15-27.65,156.07-72.76,208.47-77.3ZM568,214.45c-58.22,5.52-189.54,65.9-234.39,104.54-164.55,141.78-133.25,460.72,89.16,526.74,99.37,29.49,151.25-3.57,239.8-36.07,73.92-27.13,214.99-62.76,202.49-169.19-5.05-43-71.95-132.08-93.19-179.28-34.95-77.64-30.97-157.5-101.48-215.3-30.04-24.62-63.48-35.13-102.39-31.44Z" fill="white"/>
                      <path d="M541.41,267.61c43.38-3.96,85.03,14.63,115.42,44.99,46.12,46.07,53.19,108.76,79.59,166.31,18.03,39.32,45.84,78.9,61.27,118.16,30.53,77.71-34.74,131.9-98.61,160.49-47.32,21.18-166.45,71.33-213.74,72.07-259.82,4.08-322.49-377.1-108.88-501.03,37.36-21.68,122.92-57.16,164.96-61ZM757.75,699.92c65.98-66.57,15.37-111.39-17.66-175.94-24.71-48.28-35.17-87.92-53.21-137.3-20.87-57.16-75.06-108.91-139.43-104.17-40.85,3-130.99,43.35-165.77,66.84-207.44,140.12-95.06,536.35,176.85,442.68,53.98-18.6,161.1-53.63,199.23-92.1Z" fill="white"/>
                      <path d="M523.7,334.09c45.4-2.29,88.35,25.85,114.34,61.55,18.67,25.65,23.9,52.81,36.35,81.06,14.28,32.38,58.57,110.48,57.82,141.04-.89,36.43-35.5,70.71-64.8,88.23-30.42,18.19-149.74,69.78-182.07,72.69-187.11,16.86-254.37-250.97-131.8-368.83,34.85-33.51,122.05-73.31,170.15-75.73ZM517.01,351.76c-34.96,3.97-105.39,39.33-132.45,62.5-116.74,99.92-67.45,357.74,103,342.25,28.53-2.59,134-44.3,162.96-58.57,28.08-13.84,64.06-44.33,66.14-77.96,1.67-26.97-36.61-86.82-48.9-114.48-20.07-45.18-26.48-92.97-66.05-126.68-25.35-21.6-51.12-30.86-84.7-27.05Z" fill="white"/>
                      <path d="M383.15,695.95c-75.08-75.11-59.14-217.22,36.79-268.47,103.24-55.16,165.88-17.39,208.72,81.67,31.43,72.67,49.43,119.77-29.92,165.81-27.84,16.15-110.47,55.8-139.96,55.15-26.54-.58-57.13-15.65-75.63-34.16ZM499.28,418.23c-41.99,4.08-96.65,38.5-117.29,75.42-44.51,79.65-.35,244.88,112.29,207.54,30.61-10.15,98.42-37.76,121.74-57.7,34.09-29.15,25.13-49.63,12.29-87.48-19.82-58.41-52.18-145.26-129.03-137.79Z" fill="white"/>
                      <path d="M466.02,469.13c51.39-6.95,91.95,17.75,110.77,65.3,16.09,40.65,14.25,67.74-20.9,95.46-12.94,10.21-75.24,48.51-88.75,50.81-71.7,12.21-98.77-92.71-79.84-146.29,11.3-32,44.89-60.7,78.72-65.28ZM474.88,486.85c-32.42,4.44-61.84,34.68-65.69,67.23-4.13,34.98,14.09,119.35,64,99.45,15.86-6.33,72.23-34.89,83.05-45.43,20.53-19.98,14.37-44.5,4.41-68.61-14.93-36.14-45.63-58.14-85.78-52.64Z" fill="white"/>
                    </svg>
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
