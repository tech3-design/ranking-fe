"use client";

import type { BrandVisibility } from "@/lib/api/analyzer";
import type {
  GoogleDetails,
  RedditDetails,
  MediumDetails,
  WebMentionsDetails,
} from "@/lib/api/visibility";
import { ScoreGauge } from "@/components/analyzer/score-gauge";
import { PlatformScoreCard } from "@/components/visibility/platform-score-card";
import { PlatformBarChart } from "@/components/visibility/platform-bar-chart";
import { GoogleDetailsPanel } from "@/components/visibility/google-details-panel";
import { RedditDetailsPanel } from "@/components/visibility/reddit-details-panel";
import { MediumDetailsPanel } from "@/components/visibility/medium-details-panel";
import { WebMentionsPanel } from "@/components/visibility/web-mentions-panel";

interface BrandVisibilityTabProps {
  brandName: string;
  visibility: BrandVisibility;
}

export function BrandVisibilityTab({
  brandName,
  visibility,
}: BrandVisibilityTabProps) {
  const googleDetails = visibility.google_details as GoogleDetails;
  const redditDetails = visibility.reddit_details as RedditDetails;
  const mediumDetails = visibility.medium_details as MediumDetails;
  const webMentionsDetails = visibility.web_mentions_details as WebMentionsDetails;

  return (
    <div className="space-y-6">
      {/* Overall score + bar chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <ScoreGauge
            score={visibility.overall_score}
            size={200}
            label="Brand Visibility Score"
          />
          <p className="text-sm text-muted-foreground">
            Brand: <span className="font-medium text-foreground">{brandName}</span>
          </p>
        </div>
        <PlatformBarChart
          google={visibility.google_score}
          reddit={visibility.reddit_score}
          medium={visibility.medium_score}
          web={visibility.web_mentions_score}
        />
      </div>

      {/* Platform score cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformScoreCard
          platform="Google"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
          score={visibility.google_score}
          subScores={googleDetails.sub_scores}
        />
        <PlatformScoreCard
          platform="Reddit"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
          }
          score={visibility.reddit_score}
          subScores={redditDetails.sub_scores}
        />
        <PlatformScoreCard
          platform="Medium"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
            </svg>
          }
          score={visibility.medium_score}
          subScores={mediumDetails.sub_scores}
        />
        <PlatformScoreCard
          platform="Web Mentions"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          }
          score={visibility.web_mentions_score}
          subScores={webMentionsDetails?.sub_scores}
        />
      </div>

      {/* Detail panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <GoogleDetailsPanel
          details={googleDetails}
          score={visibility.google_score}
        />
        <RedditDetailsPanel
          details={redditDetails}
          score={visibility.reddit_score}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <MediumDetailsPanel
          details={mediumDetails}
          score={visibility.medium_score}
        />
        <WebMentionsPanel
          details={webMentionsDetails ?? {}}
          score={visibility.web_mentions_score}
        />
      </div>
    </div>
  );
}
