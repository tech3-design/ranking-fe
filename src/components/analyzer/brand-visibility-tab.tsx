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
  { key: "google_score" as const, label: "Google", color: "#F95C4B", icon: "🔍" },
  { key: "reddit_score" as const, label: "Reddit", color: "#000000", icon: "💬" },
  { key: "medium_score" as const, label: "Medium", color: "#A39888", icon: "✍️" },
  { key: "web_mentions_score" as const, label: "Web Mentions", color: "#C4BAA8", icon: "🌐" },
];

export function BrandVisibilityTab({ brandName, visibility }: BrandVisibilityTabProps) {
  const googleDetails = visibility.google_details as GoogleDetails;
  const redditDetails = visibility.reddit_details as RedditDetails;
  const mediumDetails = visibility.medium_details as MediumDetails;
  const webMentionsDetails = visibility.web_mentions_details as WebMentionsDetails;

  const overall = Math.round(visibility.overall_score);

  return (
    <div className="space-y-4">
      {/* Header + Overall Score */}
      <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid #E4DED240" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#000000]">Brand Visibility</h2>
            <p className="mt-1 text-sm text-[#000000]/40">
              How <span className="text-[#000000] font-medium">{brandName}</span> appears across AI platforms
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#E4DED2" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#F95C4B" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  strokeDashoffset={`${2 * Math.PI * 15 * (1 - overall / 100)}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#000000]">{overall}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000000]">{overall}/100</p>
              <p className="text-xs text-[#000000]/40">Overall Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLATFORMS.map((p) => {
          const score = Math.round(visibility[p.key] ?? 0);
          const rating = score >= 70 ? "Excellent" : score >= 40 ? "Average" : "Needs work";
          const ratingColor = score >= 70 ? "#22c55e" : score >= 40 ? "#D97706" : "#F95C4B";
          return (
            <div key={p.key} className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E4DED240" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{p.icon}</span>
                <p className="text-sm font-semibold text-[#000000]">{p.label}</p>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-[#000000]">{score}</p>
                <p className="text-xs text-[#000000]/40 mb-1">/100</p>
              </div>
              <div className="h-2 rounded-full mb-2" style={{ backgroundColor: "#E4DED260" }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: p.color }} />
              </div>
              <p className="text-[10px] font-medium" style={{ color: ratingColor }}>{rating}</p>
            </div>
          );
        })}
      </div>

      {/* Detail panels */}
      <div className="grid gap-4 md:grid-cols-2">
        <GoogleDetailsPanel details={googleDetails} score={visibility.google_score} />
        <RedditDetailsPanel details={redditDetails} score={visibility.reddit_score} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MediumDetailsPanel details={mediumDetails} score={visibility.medium_score} />
        <WebMentionsPanel details={webMentionsDetails ?? {}} score={visibility.web_mentions_score} />
      </div>
    </div>
  );
}
