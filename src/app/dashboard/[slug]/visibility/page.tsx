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
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Brand Presence</h2>
          <p className="text-xs mt-1 text-muted-foreground">
            How AI engines and platforms see your brand
          </p>
        </div>
        {!gaLoading && !gaIntegration && (
          <button
            onClick={handleConnectGA}
            disabled={connecting}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl transition hover:bg-primary/90 disabled:opacity-50"
          >
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
            {connecting ? "Connecting..." : "Connect Analytics"}
          </button>
        )}
        {!gaLoading && gaIntegration && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#22c55e] bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> GA Connected
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
            <div className="bg-card rounded-2xl p-6 border border-border">
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
