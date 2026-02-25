"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/lib/config";
import {
  getIntegrationStatus,
  getGAAuthUrl,
  disconnectGA,
  disconnectShopify,
  disconnectWordPress,
  type IntegrationInfo,
} from "@/lib/api/integrations";
import { GAPropertySelector } from "@/components/integrations/ga-property-selector";
import { ShopifyConnectForm } from "@/components/integrations/shopify-connect-form";
import { ShopifyEcommerceTab } from "@/components/integrations/shopify-ecommerce-tab";
import { WordPressConnectForm } from "@/components/integrations/wordpress-connect-form";
import { WordPressContentTab } from "@/components/integrations/wordpress-content-tab";

export default function IntegrationsSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [disconnectingShopify, setDisconnectingShopify] = useState(false);
  const [disconnectingWordPress, setDisconnectingWordPress] = useState(false);

  const gaIntegration = integrations.find(
    (i) => i.provider === "google_analytics" && i.is_active,
  );
  const hasProperty = !!gaIntegration?.metadata?.property_id;

  const shopifyIntegration = integrations.find(
    (i) => i.provider === "shopify" && i.is_active,
  );

  const wordpressIntegration = integrations.find(
    (i) => i.provider === "wordpress" && i.is_active,
  );
  const connectedCount = [gaIntegration, shopifyIntegration, wordpressIntegration].filter(Boolean).length;

  const loadIntegrations = useCallback(async () => {
    if (!email) return;
    try {
      const data = await getIntegrationStatus(email);
      setIntegrations(data);
    } catch {
      // No integrations yet — that's fine
    } finally {
      setLoading(false);
    }
  }, [email]);

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

  async function handleDisconnectShopify() {
    if (!email) return;
    setDisconnectingShopify(true);
    setError(null);
    try {
      await disconnectShopify(email);
      setIntegrations((prev) =>
        prev.filter((i) => i.provider !== "shopify"),
      );
    } catch {
      setError("Failed to disconnect Shopify.");
    } finally {
      setDisconnectingShopify(false);
    }
  }

  async function handleDisconnectWordPress() {
    if (!email) return;
    setDisconnectingWordPress(true);
    setError(null);
    try {
      await disconnectWordPress(email);
      setIntegrations((prev) => prev.filter((i) => i.provider !== "wordpress"));
    } catch {
      setError("Failed to disconnect WordPress.");
    } finally {
      setDisconnectingWordPress(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Integrations</h1>
            <p className="mt-1 text-muted-foreground">
              Connect services to enrich your GEO analysis with real business data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              {connectedCount}/3 connected
            </span>
            <Link
              href={routes.analyzer}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Analyzer
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google Analytics Card */}
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
              Connect your GA4 property to see real traffic data alongside GEO
              scores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Checking connection status...</p>
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
                            &mdash; {gaIntegration.metadata.property_name}
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
                  <GAPropertySelector
                    email={email}
                    onPropertySelected={loadIntegrations}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-600">
                      Property selected
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full"
              >
                {connecting ? "Redirecting..." : "Connect Google Analytics"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Shopify Card */}
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
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Shopify
            </CardTitle>
            <CardDescription>
              Connect your Shopify store to see product and revenue data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Checking connection status...</p>
            ) : shopifyIntegration ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border/70 bg-background/70 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">Connected</span>
                      {typeof shopifyIntegration.metadata?.shop_name === "string" &&
                        shopifyIntegration.metadata.shop_name && (
                          <span className="text-sm text-muted-foreground">
                            &mdash; {shopifyIntegration.metadata.shop_name}
                          </span>
                        )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisconnectShopify}
                      disabled={disconnectingShopify}
                    >
                      {disconnectingShopify ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  </div>
                </div>
                <ShopifyEcommerceTab email={email} />
              </div>
            ) : (
              <ShopifyConnectForm
                email={email}
                onConnected={loadIntegrations}
              />
            )}
          </CardContent>
        </Card>

        {/* WordPress Card */}
        <Card className="glass-card border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M7.8 9.2h.2c.5 2.1 1.6 4.6 2.8 6.6M12 6.2c-.8 2.6-2 5.2-3.6 7.6M12.5 17.7c1.5-2.5 2.5-5.3 3.1-8.1h.7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              WordPress
            </CardTitle>
            <CardDescription>
              Connect your WordPress site to track publishing activity and content output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Checking connection status...</p>
            ) : wordpressIntegration ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border/70 bg-background/70 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">Connected</span>
                      {typeof wordpressIntegration.metadata?.site_name === "string" &&
                        wordpressIntegration.metadata.site_name && (
                          <span className="text-sm text-muted-foreground">
                            &mdash; {wordpressIntegration.metadata.site_name}
                          </span>
                        )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisconnectWordPress}
                      disabled={disconnectingWordPress}
                    >
                      {disconnectingWordPress ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  </div>
                </div>
                <WordPressContentTab email={email} />
              </div>
            ) : (
              <WordPressConnectForm email={email} onConnected={loadIntegrations} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
