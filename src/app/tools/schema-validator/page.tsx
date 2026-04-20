"use client";

import { useState } from "react";
import { ArrowRight, Globe, CircleCheck, CircleAlert, Circle } from "lucide-react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { Button } from "@/components/ui/button";

export default function SchemaValidatorToolPage() {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <LandingMarketingShell>
      <ToolPage
        theme="violet"
        eyebrow="[ free tool · schema validator ]"
        title="Check JSON-LD coverage in"
        titleAccent="seconds"
        description="Paste any URL and we'll scan the page for Organization, Product, Article, FAQ, and other JSON-LD schemas — flagging missing, partial, or malformed entries."
        form={
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 rounded-xl border border-violet-700/25 bg-white p-1.5 shadow-sm">
            <Globe className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              placeholder="Paste a page URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button type="submit" className="shrink-0 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:brightness-110">
              Validate
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>
        }
        features={[
          { title: "18 schema types", description: "Organization, Product, Article, FAQ, HowTo, BreadcrumbList, and more checked automatically." },
          { title: "Field-level flags", description: "Missing required fields highlighted with the property name so engineers fix fast." },
          { title: "Duplicate detection", description: "Catch duplicate or conflicting JSON-LD blocks that confuse AI engines." },
          { title: "Exportable", description: "Download a JSON summary of all findings for your engineering or SEO team." },
        ]}
        previewEyebrow="[ what you see ]"
        previewTitle="Sample"
        previewTitleAccent="schema report"
        previewDescription="Free tool shows the top-level schema health for one page. Unlock site-wide coverage, per-template roll-ups, and fix suggestions on a paid plan."
        previewRows={[
          { content: <PreviewSchemaChecks /> },
          { content: <PreviewSiteRollup />, locked: true },
          { content: <PreviewFixSuggestions />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewSchemaChecks() {
  const rows = [
    { name: "Organization", status: "ok", detail: "Valid · 8 fields" },
    { name: "Product", status: "partial", detail: "Missing: aggregateRating, offers.priceCurrency" },
    { name: "FAQ", status: "ok", detail: "Valid · 6 Q&A items" },
    { name: "Article", status: "missing", detail: "Not detected on this page" },
    { name: "BreadcrumbList", status: "ok", detail: "Valid · 3 items" },
  ];
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Schema health · /pricing</p>
      <ul className="mt-3 divide-y divide-black/6">
        {rows.map((r) => {
          const iconFor =
            r.status === "ok" ? (
              <CircleCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : r.status === "partial" ? (
              <CircleAlert className="h-4 w-4 text-amber-500" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 text-neutral-400" aria-hidden />
            );
          return (
            <li key={r.name} className="flex items-center gap-3 py-2.5">
              {iconFor}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-neutral-900">{r.name}</p>
                <p className="text-[11px] text-neutral-500">{r.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PreviewSiteRollup() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Site-wide coverage</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Roll-up per template: which URLs ship Organization, which are missing Product, where FAQ is inconsistent.
      </p>
    </div>
  );
}

function PreviewFixSuggestions() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Fix suggestions</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ready-to-paste JSON-LD snippets for each missing field, ranked by GEO score impact.
      </p>
    </div>
  );
}
