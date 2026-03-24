"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getRunBySlug,
  type AnalysisRunDetail,
} from "@/lib/api/analyzer";
import { RecommendationsPanel } from "@/components/analyzer/recommendations-panel";
import { AlertCircle } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function RecommendationsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [run, setRun] = useState<AnalysisRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const email = session?.user?.email ?? "";

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const detail = await getRunBySlug(slug);
      setRun(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
