"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getRunBySlug,
  getShareOfVoice,
  type AnalysisRunDetail,
  type ShareOfVoiceItem,
} from "@/lib/api/analyzer";
import { BrandVisibilityTab } from "@/components/analyzer/brand-visibility-tab";
import { ShareOfVoicePanel } from "@/components/analyzer/share-of-voice-panel";
import { AlertCircle } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function VisibilityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [run, setRun] = useState<AnalysisRunDetail | null>(null);
  const [sov, setSov] = useState<ShareOfVoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const [detail, sovData] = await Promise.all([
        getRunBySlug(slug),
        getShareOfVoice(slug).catch(() => []),
      ]);
      setRun(detail);
      setSov(sovData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const brandVis = run?.brand_visibility;

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Brand Visibility</h2>
        <p className="text-xs mt-1 text-muted-foreground">
          How AI engines and platforms see your brand
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <SignalorLoader label="Loading visibility data..." />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 px-5 py-4 text-sm text-primary">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {run && !loading && (
        <>
          {brandVis && (
            <>
              <BrandVisibilityTab
                brandName={run.brand_name}
                visibility={brandVis}
              />
            </>
          )}

          {sov.length > 0 && <ShareOfVoicePanel data={sov} />}

          {!brandVis && sov.length === 0 && (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No visibility data available for this analysis run.
            </div>
          )}
        </>
      )}
    </div>
  );
}
