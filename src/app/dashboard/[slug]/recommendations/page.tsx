"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useRun } from "../_components/run-context";
import { RecommendationsPanel } from "@/components/analyzer/recommendations-panel";
import { getIntegrationStatus } from "@/lib/api/integrations";
import { AlertCircle } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

function detectPlatform(url?: string, integrations?: { provider: string; is_active: boolean }[]): "shopify" | "wordpress" | undefined {
  // Check integrations first (most reliable)
  if (integrations) {
    if (integrations.some((i) => i.provider === "shopify" && i.is_active)) return "shopify";
    if (integrations.some((i) => i.provider === "wordpress" && i.is_active)) return "wordpress";
  }
  // Fallback to URL detection
  if (url?.includes(".myshopify.com")) return "shopify";
  return undefined;
}

export default function RecommendationsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { run, loading, error, fixResults, setFixResult } = useRun();
  const [platform, setPlatform] = useState<"shopify" | "wordpress" | undefined>();

  const email = session?.user?.email ?? "";

  // Detect platform from integrations
  useEffect(() => {
    if (!email) return;
    getIntegrationStatus(email)
      .then((integrations) => setPlatform(detectPlatform(run?.url, integrations)))
      .catch(() => setPlatform(detectPlatform(run?.url)));
  }, [email, run?.url]);

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Recommendations</h2>
        <p className="text-xs mt-1 text-muted-foreground">
          {run ? `${run.recommendations.length} items to improve your GEO score` : "Loading..."}
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <SignalorLoader label="Loading recommendations..." />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 px-5 py-4 text-sm text-primary">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {run && !loading && run.recommendations.length > 0 && (
        <RecommendationsPanel
          recommendations={run.recommendations}
          slug={slug}
          email={email}
          platform={platform}
          initialFixResults={fixResults}
          onFixResult={setFixResult}
        />
      )}

      {run && !loading && run.recommendations.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">
          No recommendations found for this analysis run.
        </div>
      )}
    </div>
  );
}
