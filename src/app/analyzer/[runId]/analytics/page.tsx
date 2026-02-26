"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GAPropertySelector } from "@/components/integrations/ga-property-selector";
import { GATrafficTab } from "@/components/integrations/ga-traffic-tab";
import {
  disconnectGA,
  getGAAuthUrl,
  getIntegrationStatus,
  type IntegrationInfo,
} from "@/lib/api/integrations";
import { getRunDetail, type AnalysisRunDetail } from "@/lib/api/analyzer";

export default function RunAnalyticsPage() {
  const params = useParams();
  const runId = Number(params.runId);
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
      // ignore empty state
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (!runId) return;
    getRunDetail(runId)
      .then((detail) => setRun(detail))
      .catch(() => setRun(null));
  }, [runId]);

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
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full overflow-hidden border border-border/60 bg-background/30">
        <AppSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="mt-1 text-muted-foreground">
                Connect Google Analytics and review traffic for this analyzed run.
              </p>
              {run?.url ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Run #{runId} - {run.url}
                </p>
              ) : null}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Card className="glass-card border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.5 3.5L12 12L8 8L3.5 12.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 3.5H20.5V10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Google Analytics
                </CardTitle>
                <CardDescription>
                  This section is dedicated to GA4 setup and page-specific traffic for this run.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    Checking connection status...
                  </p>
                ) : gaIntegration ? (
                  <div className="space-y-4">
                    <div className="rounded-md border border-border/70 bg-background/70 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium">Connected</span>
                          {typeof gaIntegration.metadata?.property_name === "string" &&
                            gaIntegration.metadata.property_name && (
                              <span className="text-sm text-muted-foreground">
                                - {gaIntegration.metadata.property_name}
                              </span>
                            )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                        >
                          {disconnecting ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      </div>
                    </div>

                    {!hasProperty ? (
                      <GAPropertySelector email={email} onPropertySelected={loadIntegrations} />
                    ) : (
                      <GATrafficTab email={email} analyzedUrl={run?.url} />
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full md:w-auto"
                  >
                    {connecting ? "Redirecting..." : "Connect Google Analytics"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
