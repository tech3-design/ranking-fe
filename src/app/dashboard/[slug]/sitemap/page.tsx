import type { Metadata } from "next";
import { SitemapAuditShell } from "@/components/analyzer/sitemap-audit-shell";

export const metadata: Metadata = {
  title: "Sitemap · Signalor",
  description: "Page-level audit of speed, structure, and AI readiness.",
};

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2 px-2 sm:px-0">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Sitemap
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Page-level audit of speed, structure, and AI readiness.
          </p>
        </div>
        <a
          href="https://docs.signalor.ai/sitemap"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View documentation"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </div>
      <SitemapAuditShell slug={slug} />
    </div>
  );
}
