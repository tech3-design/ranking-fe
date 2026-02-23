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
  type IntegrationInfo,
} from "@/lib/api/integrations";
import { GAPropertySelector } from "@/components/integrations/ga-property-selector";
import { ShopifyConnectForm } from "@/components/integrations/shopify-connect-form";
import { ShopifyEcommerceTab } from "@/components/integrations/shopify-ecommerce-tab";

export default function IntegrationsSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [disconnectingShopify, setDisconnectingShopify] = useState(false);

  const gaIntegration = integrations.find(
    (i) => i.provider === "google_analytics" && i.is_active,
  );
  const hasProperty = !!gaIntegration?.metadata?.property_id;

  const shopifyIntegration = integrations.find(
    (i) => i.provider === "shopify" && i.is_active,
  );

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

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link
          href={routes.analyzer}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border hover:bg-accent"
        >
          Analyzer
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl space-y-6 pt-12">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect external services to see real data alongside your GEO
            scores.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google Analytics Card */}
        <Card>
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
              <p className="text-sm text-muted-foreground">
                Checking connection status...
              </p>
            ) : gaIntegration ? (
              <div className="space-y-4">
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

                {!hasProperty && (
                  <GAPropertySelector
                    email={email}
                    onPropertySelected={loadIntegrations}
                  />
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
        <Card>
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
              <p className="text-sm text-muted-foreground">
                Checking connection status...
              </p>
            ) : shopifyIntegration ? (
              <div className="space-y-4">
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
      </div>
    </div>
  );
}
