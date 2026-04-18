"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getShareOfVoice,
  type ShareOfVoiceItem,
} from "@/lib/api/analyzer";
import {
  getGAAuthUrl,
  getIntegrationStatus,
  type IntegrationInfo,
} from "@/lib/api/integrations";
import { useRun } from "../_components/run-context";
import { BrandVisibilityTab } from "@/components/analyzer/brand-visibility-tab";
import { ShareOfVoicePanel } from "@/components/analyzer/share-of-voice-panel";
import { GAPropertySelector } from "@/components/integrations/ga-property-selector";
import { GATrafficTab } from "@/components/integrations/ga-traffic-tab";
import { AlertCircle, BarChart3, Loader2, CheckCircle2 } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function VisibilityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { run, loading, error } = useRun();
  const [sov, setSov] = useState<ShareOfVoiceItem[]>([]);

  const email = session?.user?.email ?? "";
  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [gaLoading, setGaLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getShareOfVoice(slug).catch(() => []).then(setSov);
  }, [slug]);

  const loadIntegrations = useCallback(async () => {
    if (!email) return;
    try {
      const data = await getIntegrationStatus(email);
      setIntegrations(data);
    } catch { /* ignore */ }
    finally { setGaLoading(false); }
  }, [email]);

  useEffect(() => { loadIntegrations(); }, [loadIntegrations]);

  const gaIntegration = integrations.find((i) => i.provider === "google_analytics" && i.is_active);
  const hasProperty = !!gaIntegration?.metadata?.property_id;

  async function handleConnectGA() {
    if (!email) return;
    setConnecting(true);
    try {
      const { auth_url } = await getGAAuthUrl(email);
      window.location.href = auth_url;
    } catch {
      setConnecting(false);
    }
  }

  const brandVis = run?.brand_visibility;

  return (
    <div className="px-8 py-8 space-y-4">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Brand Presence
          </p>
          <h2 className="text-[28px] font-semibold tracking-tight leading-[1.1] text-foreground">
            Visibility across the web
          </h2>
          <p className="text-sm mt-2 text-muted-foreground max-w-xl">
            How AI engines, search, and social platforms see your brand.
          </p>
        </div>
        {!gaLoading && !gaIntegration && (
          <button
            onClick={handleConnectGA}
            disabled={connecting}
            className="inline-flex items-center gap-1.5 rounded-md h-9 px-3.5 text-xs font-medium text-white transition disabled:opacity-50 hover:brightness-110 bg-[#F95C4B]"
          >
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
            {connecting ? "Connecting…" : "Connect Analytics"}
          </button>
        )}
        {!gaLoading && gaIntegration && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#16a34a] bg-[#16a34a]/10 border border-[#16a34a]/20 px-2.5 h-7 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> GA connected
          </span>
        )}
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
            <BrandVisibilityTab
              brandName={run.display_brand_name?.trim() || run.brand_name}
              visibility={brandVis}
            />
          )}

          {sov.length > 0 && <ShareOfVoicePanel data={sov} />}

          {!brandVis && sov.length === 0 && (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No visibility data available for this analysis run.
            </div>
          )}

          {/* GA Traffic Data (if connected) */}
          {gaIntegration && !gaLoading && (
            <div className="bg-card rounded-xl p-6 border border-border/70">
              {!hasProperty ? (
                <GAPropertySelector email={email} onPropertySelected={loadIntegrations} />
              ) : (
                <GATrafficTab email={email} analyzedUrl={run?.url} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
