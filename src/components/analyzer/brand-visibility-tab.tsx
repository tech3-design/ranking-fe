"use client";

import type { BrandVisibility } from "@/lib/api/analyzer";
import type {
  GoogleDetails,
  RedditDetails,
  MediumDetails,
  WebMentionsDetails,
} from "@/lib/api/visibility";
import { GoogleDetailsPanel } from "@/components/visibility/google-details-panel";
import { RedditDetailsPanel } from "@/components/visibility/reddit-details-panel";
import { MediumDetailsPanel } from "@/components/visibility/medium-details-panel";
import { WebMentionsPanel } from "@/components/visibility/web-mentions-panel";

interface BrandVisibilityTabProps {
  brandName: string;
  visibility: BrandVisibility;
}

const PLATFORMS = [
  { key: "google_score" as const, label: "Google", color: "#3ecf8e" },
  { key: "reddit_score" as const, label: "Reddit", color: "#f97316" },
  { key: "medium_score" as const, label: "Medium", color: "#3b82f6" },
  { key: "web_mentions_score" as const, label: "Web", color: "#a855f7" },
];

export function BrandVisibilityTab({ brandName, visibility }: BrandVisibilityTabProps) {
  const googleDetails = visibility.google_details as GoogleDetails;
  const redditDetails = visibility.reddit_details as RedditDetails;
  const mediumDetails = visibility.medium_details as MediumDetails;
  const webMentionsDetails = visibility.web_mentions_details as WebMentionsDetails;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Brand Visibility</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How <span className="text-foreground font-medium">{brandName}</span> appears across platforms
        </p>
      </div>

      {/* Overall score + Platform scores */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5 md:gap-3">
        {/* Overall */}
        <div className="rounded-lg border border-primary/20 bg-primary/[0.06] p-5 text-center">
          <p className="text-3xl font-bold text-primary">{Math.round(visibility.overall_score)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Overall Score</p>
        </div>

        {/* Per platform */}
        {PLATFORMS.map((p) => {
          const score = Math.round(visibility[p.key] ?? 0);
          return (
            <div key={p.key} className="rounded-lg border border-border bg-card p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{score}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                <p className="text-xs text-muted-foreground">{p.label}</p>
              </div>
              {/* Mini bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.06]">
                <div className="h-1.5 rounded-full" style={{ width: `${score}%`, backgroundColor: p.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panels */}
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <GoogleDetailsPanel details={googleDetails} score={visibility.google_score} />
        <RedditDetailsPanel details={redditDetails} score={visibility.reddit_score} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <MediumDetailsPanel details={mediumDetails} score={visibility.medium_score} />
        <WebMentionsPanel details={webMentionsDetails ?? {}} score={visibility.web_mentions_score} />
      </div>
    </div>
  );
}
