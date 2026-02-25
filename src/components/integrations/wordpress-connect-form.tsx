"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectWordPress } from "@/lib/api/integrations";

interface WordPressConnectFormProps {
  email: string;
  onConnected: () => void;
}

export function WordPressConnectForm({
  email,
  onConnected,
}: WordPressConnectFormProps) {
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!siteUrl.trim() || !username.trim() || !appPassword.trim()) return;

    setConnecting(true);
    setError(null);
    try {
      await connectWordPress(
        email,
        siteUrl.trim(),
        username.trim(),
        appPassword.trim(),
      );
      onConnected();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to connect WordPress.";
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
        <label className="text-sm font-medium" htmlFor="wp-site-url">
          Site URL
        </label>
        <Input
          id="wp-site-url"
          placeholder="https://example.com"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          disabled={connecting}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="wp-username">
          WordPress Username
        </label>
        <Input
          id="wp-username"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={connecting}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="wp-app-password">
          Application Password
        </label>
        <Input
          id="wp-app-password"
          type="password"
          placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          disabled={connecting}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Generate this in WordPress: Users &gt; Profile &gt; Application
          Passwords.
        </p>
      </div>
      <Button type="submit" disabled={connecting} className="w-full">
        {connecting ? "Connecting..." : "Connect WordPress"}
      </Button>
    </form>
  );
}
