"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getShareOfVoice, type ShareOfVoiceItem } from "@/lib/api/analyzer";
import { getGAAuthUrl, getIntegrationStatus, type IntegrationInfo } from "@/lib/api/integrations";
import { useRun } from "../_components/run-context";
import { BrandVisibilityTab } from "@/components/analyzer/brand-visibility-tab";
import { GAPropertySelector } from "@/components/integrations/ga-property-selector";
import { GATrafficTab } from "@/components/integrations/ga-traffic-tab";
import { AlertCircle, BarChart3, Loader2, CheckCircle2 } from "@/components/icons";
import { VisibilitySkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VisibilityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { run, loading, error } = useRun();
  const queryClient = useQueryClient();

  const email = session?.user?.email ?? "";
  const [connecting, setConnecting] = useState(false);

  // Cached across tab switches via QueryClient (staleTime 5min, gcTime 30min).
  const { data: sov = [] as ShareOfVoiceItem[], isLoading: sovLoading } = useQuery({
    queryKey: ["share-of-voice", slug],
    enabled: !!slug,
    queryFn: () => getShareOfVoice(slug).catch(() => [] as ShareOfVoiceItem[]),
  });

  const { data: integrations = [] as IntegrationInfo[], isLoading: gaLoading } = useQuery({
    queryKey: ["integration-status", email],
    enabled: !!email,
    queryFn: () => getIntegrationStatus(email),
  });

  const loadIntegrations = () => {
    if (email) queryClient.invalidateQueries({ queryKey: ["integration-status", email] });
  };

  const allLoading = loading || sovLoading;

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
    <div className="space-y-6 px-2 py-2 sm:px-0">
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        data-tour-card="visibility-header"
      >
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Brand presence
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            How AI engines and platforms surface your brand
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!gaLoading && !gaIntegration ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleConnectGA}
              disabled={connecting}
              className="auth-cta-btn gap-1.5 text-xs font-semibold"
            >
              {connecting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <BarChart3 className="size-3.5" />
              )}
              {connecting ? "Connecting…" : "Connect Analytics"}
            </Button>
          ) : null}
          {!gaLoading && gaIntegration ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400",
              )}
            >
              <CheckCircle2 className="size-3.5 shrink-0" /> GA connected
            </span>
          ) : null}
        </div>
      </div>

      {allLoading && <VisibilitySkeleton />}

      {error && !allLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-primary">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {run && !allLoading && (
        <>
          {brandVis && (
            <div data-tour-card="visibility-brand">
              <BrandVisibilityTab
                brandName={run.display_brand_name?.trim() || run.brand_name}
                visibility={brandVis}
                sov={sov}
              />
            </div>
          )}

          {!brandVis && sov.length === 0 && (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No visibility data available for this analysis run.
            </div>
          )}

          {/* GA Traffic Data (if connected) */}
          {gaIntegration && !gaLoading && (
            <div
              className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none sm:p-6"
              data-tour-card="visibility-ga"
            >
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
