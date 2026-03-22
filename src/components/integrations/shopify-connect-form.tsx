"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getShopifyAuthUrl } from "@/lib/api/integrations";

interface ShopifyConnectFormProps {
  email: string;
  orgId?: number;
  onConnected: () => void;
}

export function ShopifyConnectForm({ email, orgId, onConnected }: ShopifyConnectFormProps) {
  const [shopDomain, setShopDomain] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopDomain.trim()) return;

    setConnecting(true);
    setError(null);

    try {
      const returnTo =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/settings/integrations";
      const { auth_url } = await getShopifyAuthUrl(email, shopDomain.trim(), returnTo, orgId);
      window.location.href = auth_url;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to start Shopify connection.";
      setError(message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <label className="text-sm font-medium" htmlFor="shop-domain">
          Store URL
        </label>
        <Input
          id="shop-domain"
          placeholder="your-store.myshopify.com or https://your-store.com"
          value={shopDomain}
          onChange={(e) => setShopDomain(e.target.value)}
          disabled={connecting}
          className="mt-1"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Paste your store URL or myshopify.com domain. You&apos;ll be redirected to Shopify to authorize access.
      </p>
      <Button type="submit" disabled={connecting} className="w-full">
        {connecting ? "Redirecting to Shopify..." : "Connect Shopify"}
      </Button>
    </form>
  );
}
