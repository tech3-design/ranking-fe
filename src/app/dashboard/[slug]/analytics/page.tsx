"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  disconnectGA,
  getGAAuthUrl,
  getIntegrationStatus,
  type IntegrationInfo,
} from "@/lib/api/integrations";
import { getRunBySlug, type AnalysisRunDetail } from "@/lib/api/analyzer";
import { GAPropertySelector } from "@/components/integrations/ga-property-selector";
import { GATrafficTab } from "@/components/integrations/ga-traffic-tab";
import { Loader2, AlertCircle, Unplug, PlugZap } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function ProjectAnalyticsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [run, setRun] = useState<AnalysisRunDetail | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gaIntegration = integrations.find(
    (i) => i.provider === "google_analytics" && i.is_active,
  );
  const hasProperty = !!gaIntegration?.metadata?.property_id;

  const loadIntegrations = useCallback(async () => {
    if (!email) return;
    try {
      const data = await getIntegrationStatus(email);
      setIntegrations(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (!slug) return;
    getRunBySlug(slug)
      .then((detail) => setRun(detail))
      .catch(() => setRun(null));
  }, [slug]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  async function handleConnect() {
    if (!email) return;
    setConnecting(true);
    setError(null);
    try {
      const { auth_url } = await getGAAuthUrl(email);
      window.location.href = auth_url;
    } catch {
      setError("Failed to start Google Analytics connection.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!email) return;
    setDisconnecting(true);
    setError(null);
    try {
      await disconnectGA(email);
      setIntegrations((prev) =>
        prev.filter((i) => i.provider !== "google_analytics"),
      );
    } catch {
      setError("Failed to disconnect Google Analytics.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-xs mt-1 text-muted-foreground">
          Connect Google Analytics and review traffic for this project.
        </p>
        {run?.url && (
          <p className="mt-2 text-xs text-muted-foreground">{run.url}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 px-5 py-4 text-sm text-primary">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* GA Card */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="mb-1">
          <h3 className="text-base font-semibold text-foreground">Google Analytics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">GA4 setup and page-specific traffic for this project.</p>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <SignalorLoader size="sm" label="Checking connection..." />
            </div>
          ) : gaIntegration ? (
            <div className="space-y-4">
              <div className="rounded-xl p-3 border border-border bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#22c55e]" />
                    <span className="text-sm font-medium text-foreground">Connected</span>
                    {typeof gaIntegration.metadata?.property_name === "string" &&
                      gaIntegration.metadata.property_name && (
                        <span className="text-sm text-muted-foreground">
                          — {gaIntegration.metadata.property_name}
                        </span>
                      )}
                  </div>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 transition disabled:opacity-50"
                  >
                    <Unplug className="w-3 h-3" />
                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              </div>

              {!hasProperty ? (
                <GAPropertySelector email={email} onPropertySelected={loadIntegrations} />
              ) : (
                <GATrafficTab email={email} analyzedUrl={run?.url} />
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white bg-primary transition hover:opacity-90 disabled:opacity-50"
            >
              <PlugZap className="w-4 h-4" />
              {connecting ? "Redirecting..." : "Connect Google Analytics"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
