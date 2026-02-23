"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectShopify } from "@/lib/api/integrations";

interface ShopifyConnectFormProps {
  email: string;
  onConnected: () => void;
}

export function ShopifyConnectForm({ email, onConnected }: ShopifyConnectFormProps) {
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopDomain.trim() || !accessToken.trim()) return;

    setConnecting(true);
    setError(null);

    try {
      await connectShopify(email, shopDomain.trim(), accessToken.trim());
      onConnected();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to connect Shopify.";
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
          Shop Domain
        </label>
        <Input
          id="shop-domain"
          placeholder="your-store.myshopify.com"
          value={shopDomain}
          onChange={(e) => setShopDomain(e.target.value)}
          disabled={connecting}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="access-token">
          Access Token
        </label>
        <Input
          id="access-token"
          type="password"
          placeholder="shpat_xxxxx..."
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          disabled={connecting}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          From your Shopify Custom App &rarr; API credentials &rarr; Admin API access token.
        </p>
      </div>
      <Button type="submit" disabled={connecting} className="w-full">
        {connecting ? "Connecting..." : "Connect Shopify"}
      </Button>
    </form>
  );
}
