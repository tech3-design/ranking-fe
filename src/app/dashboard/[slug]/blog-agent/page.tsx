"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useRun } from "../_components/run-context";
import { BlogAutomationPanel } from "@/components/analyzer/blog-automation-panel";
import {
  getIntegrationStatus,
  connectWordPress,
  disconnectWordPress,
  connectShopify,
  getShopifyAuthUrl,
  disconnectShopify,
  type IntegrationInfo,
} from "@/lib/api/integrations";
import {
  AlertCircle,
  Check,
  Globe,
  Info,
  Loader2,
  X,
} from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type CMS = "wordpress" | "shopify" | "unknown";

// ── CMS helpers ────────────────────────────────────────────────────────────────

function detectCMS(url: string | undefined, integrations: IntegrationInfo[]): CMS {
  if (integrations.some((i) => i.provider === "wordpress" && i.is_active)) return "wordpress";
  if (integrations.some((i) => i.provider === "shopify" && i.is_active)) return "shopify";
  if (url?.includes(".myshopify.com")) return "shopify";
  return "unknown";
}

function getActiveIntegration(cms: CMS, integrations: IntegrationInfo[]): IntegrationInfo | undefined {
  if (cms === "wordpress") return integrations.find((i) => i.provider === "wordpress" && i.is_active);
  if (cms === "shopify") return integrations.find((i) => i.provider === "shopify" && i.is_active);
}

// ── Setup steps ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Connect CMS", sub: "Link your WordPress or Shopify site" },
  { label: "Configure", sub: "Set topics, frequency, and mode" },
  { label: "Generate", sub: "AI-powered blog drafts", soon: true },
  { label: "Auto publish", sub: "Publish on schedule", soon: true },
];

// ── CMS branding ───────────────────────────────────────────────────────────────

const CMS_META: Record<"wordpress" | "shopify", { name: string; color: string; logoText: string }> = {
  wordpress: {
    name: "WordPress",
    color: "#21759B",
    logoText: "WP",
  },
  shopify: {
    name: "Shopify",
    color: "#96BF48",
    logoText: "SH",
  },
};

// ── Setup stepper ──────────────────────────────────────────────────────────────

function SetupStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/65 px-5 py-4">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Setup progress
      </p>
      <div className="flex items-start gap-0">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep && !step.soon;
          return (
            <div key={step.label} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                {/* Circle + connector */}
                <div className="flex w-full items-center">
                  <div className={cn("h-px flex-1", i === 0 ? "invisible" : done ? "bg-primary" : "bg-border/60")} />
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                      done
                        ? "bg-primary text-white"
                        : active
                        ? "border-2 border-primary text-primary bg-white"
                        : "border border-border/60 bg-card text-muted-foreground",
                      step.soon && !done && !active && "opacity-40",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <div className={cn("h-px flex-1", i === STEPS.length - 1 ? "invisible" : done ? "bg-primary" : "bg-border/60")} />
                </div>
                {/* Label */}
                <div className={cn("text-center", step.soon && !done && !active && "opacity-40")}>
                  <p
                    className={cn(
                      "text-[11px] font-semibold leading-tight",
                      done || active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                    {step.soon && (
                      <span className="ml-1 text-[9px] font-normal text-muted-foreground/60">(soon)</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{step.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CMS detection card ─────────────────────────────────────────────────────────

function CMSDetectionCard({ cms, runUrl }: { cms: CMS; runUrl?: string }) {
  const meta = cms !== "unknown" ? CMS_META[cms] : null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/65 p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Detected platform
      </p>
      <div className="flex items-center gap-3">
        {meta ? (
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {meta.logoText}
          </span>
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted text-muted-foreground">
            <Globe className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {meta ? meta.name : "Unsupported platform"}
          </p>
          {runUrl && (
            <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{runUrl}</p>
          )}
        </div>
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            meta
              ? "bg-amber-100 text-amber-700"
              : "bg-muted text-muted-foreground",
          )}
        >
          {meta ? "Ready to connect" : "Unsupported"}
        </span>
      </div>
    </div>
  );
}

// ── Connected state card ───────────────────────────────────────────────────────

function ConnectedCard({
  cms,
  integration,
  runUrl,
  onDisconnect,
  disconnecting,
}: {
  cms: CMS;
  integration?: IntegrationInfo;
  runUrl?: string;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const meta = cms !== "unknown" ? CMS_META[cms] : null;
  const siteName =
    (integration?.metadata?.site_name as string) ||
    (integration?.metadata?.shop_name as string) ||
    runUrl ||
    "Your site";
  const updatedAt = integration?.updated_at
    ? new Date(integration.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {meta && (
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.logoText}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{siteName}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            {updatedAt && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">Last synced {updatedAt}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          disabled={disconnecting}
          className="h-8 shrink-0 border-border/80 bg-white px-3 text-[12px] text-muted-foreground hover:text-destructive"
        >
          {disconnecting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
          <span className="ml-1">{disconnecting ? "Disconnecting…" : "Disconnect"}</span>
        </Button>
      </div>
    </div>
  );
}

// ── WordPress connect card ─────────────────────────────────────────────────────

function WordPressConnectCard({
  wpUrl,
  setWpUrl,
  wpUsername,
  setWpUsername,
  wpApiKey,
  setWpApiKey,
  connecting,
  onSubmit,
}: {
  wpUrl: string;
  setWpUrl: (v: string) => void;
  wpUsername: string;
  setWpUsername: (v: string) => void;
  wpApiKey: string;
  setWpApiKey: (v: string) => void;
  connecting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isWpCom = wpUrl.includes(".wordpress.com");

  return (
    <div className="rounded-xl border border-[#21759B]/30 bg-[#21759B]/5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#21759B] text-[11px] font-bold text-white">
          WP
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Connect WordPress</p>
          <p className="text-[12px] text-muted-foreground">
            WordPress.com sites use OAuth. Self-hosted sites use an application password.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-foreground" htmlFor="wp-url">
            Site URL
          </label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="wp-url"
              value={wpUrl}
              onChange={(e) => setWpUrl(e.target.value)}
              placeholder="https://yoursite.com"
              required
              disabled={connecting}
              className="h-9 border-border/80 bg-white pl-8 text-[13px] focus-visible:ring-0"
            />
          </div>
        </div>

        {!isWpCom && (
          <>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground" htmlFor="wp-username">
                WordPress username
              </label>
              <Input
                id="wp-username"
                value={wpUsername}
                onChange={(e) => setWpUsername(e.target.value)}
                placeholder="admin"
                required
                disabled={connecting}
                className="h-9 border-border/80 bg-white text-[13px] focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-foreground" htmlFor="wp-key">
                Application password
              </label>
              <Input
                id="wp-key"
                type="password"
                value={wpApiKey}
                onChange={(e) => setWpApiKey(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                disabled={connecting}
                className="h-9 border-border/80 bg-white text-[13px] focus-visible:ring-0"
              />
              <p className="text-[11px] text-muted-foreground">
                Generate in WordPress admin → Users → Profile → Application Passwords.
              </p>
            </div>
          </>
        )}

        <div className="mt-1 flex items-center gap-2">
          <Button
            type="submit"
            disabled={connecting || !wpUrl || (!isWpCom && !wpUsername)}
            className="h-9 bg-[#21759B] px-4 text-[13px] font-semibold text-white hover:bg-[#1a5f7a]"
          >
            {connecting ? (
              <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Connecting…</>
            ) : isWpCom ? (
              "Continue with WordPress.com"
            ) : (
              "Connect WordPress"
            )}
          </Button>
        </div>
      </form>

      {/* Benefits */}
      <ul className="mt-4 space-y-1.5 border-t border-[#21759B]/20 pt-4">
        {[
          "Auto-publish AI blog posts to WordPress",
          "GEO-optimized content for AI search surfaces",
          "Review before publish or fully automated mode",
        ].map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12px] text-muted-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0 text-[#21759B]" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Shopify connect card ───────────────────────────────────────────────────────

function ShopifyConnectCard({
  shopDomain,
  setShopDomain,
  accessToken,
  setAccessToken,
  connectMode,
  setConnectMode,
  connecting,
  onSubmitToken,
  onSubmitOAuth,
}: {
  shopDomain: string;
  setShopDomain: (v: string) => void;
  accessToken: string;
  setAccessToken: (v: string) => void;
  connectMode: "token" | "oauth";
  setConnectMode: (m: "token" | "oauth") => void;
  connecting: boolean;
  onSubmitToken: (e: React.FormEvent) => void;
  onSubmitOAuth: (e: React.FormEvent) => void;
}) {
  return (
    <div className="rounded-xl border border-[#96BF48]/30 bg-[#96BF48]/5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#96BF48] text-[11px] font-bold text-white">
          SH
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Connect Shopify</p>
          <p className="text-[12px] text-muted-foreground">
            Authorize Signalor to publish blog articles to your Shopify store.
          </p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="mb-4 flex gap-1 rounded-lg border border-[#96BF48]/30 bg-white p-1">
        {(["token", "oauth"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setConnectMode(mode)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
              connectMode === mode
                ? "bg-[#96BF48] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode === "token" ? "Admin API Token" : "Shopify OAuth"}
          </button>
        ))}
      </div>

      {connectMode === "token" ? (
        <form onSubmit={onSubmitToken} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="shop-domain-token">
              Store domain
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="shop-domain-token"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="yourstore.myshopify.com"
                required
                disabled={connecting}
                className="h-9 border-border/80 bg-white pl-8 text-[13px] focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="shop-token">
              Admin API access token
            </label>
            <Input
              id="shop-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
              required
              disabled={connecting}
              className="h-9 border-border/80 bg-white text-[13px] focus-visible:ring-0"
            />
          </div>

          {/* Instructions callout */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
              <Info className="size-3.5 shrink-0" />
              How to get your Admin API token
            </p>
            <ol className="space-y-0.5 pl-1 text-[11px] text-amber-700">
              <li>1. Shopify Admin → <strong>Settings → Apps → Develop apps</strong></li>
              <li>2. Create a custom app → go to <strong>Configuration</strong> tab</li>
              <li>3. Enable <strong>write_content</strong> and <strong>read_content</strong> scopes → Save</li>
              <li>4. Click <strong>Install app</strong> → copy the Admin API access token</li>
            </ol>
          </div>

          <Button
            type="submit"
            disabled={connecting || !shopDomain || !accessToken}
            className="h-9 bg-[#96BF48] px-4 text-[13px] font-semibold text-white hover:bg-[#7da33c]"
          >
            {connecting ? (
              <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Connecting…</>
            ) : (
              "Connect Shopify"
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={onSubmitOAuth} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground" htmlFor="shop-domain-oauth">
              Store domain
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="shop-domain-oauth"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="yourstore.myshopify.com"
                required
                disabled={connecting}
                className="h-9 border-border/80 bg-white pl-8 text-[13px] focus-visible:ring-0"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={connecting || !shopDomain}
            className="h-9 bg-[#96BF48] px-4 text-[13px] font-semibold text-white hover:bg-[#7da33c]"
          >
            {connecting ? (
              <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Redirecting…</>
            ) : (
              "Connect with Shopify OAuth"
            )}
          </Button>
        </form>
      )}

      <ul className="mt-4 space-y-1.5 border-t border-[#96BF48]/20 pt-4">
        {[
          "Auto-publish blog articles to your Shopify store",
          "GEO-optimized content to improve AI search presence",
          "Secure — no passwords stored",
        ].map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12px] text-muted-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0 text-[#96BF48]" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Unsupported CMS card ───────────────────────────────────────────────────────

function UnsupportedCMSCard({ runUrl }: { runUrl?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/65 p-8 text-center">
      <Globe className="mx-auto mb-3 size-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">Platform not yet supported</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {runUrl ? (
          <>
            <span className="font-medium">{runUrl}</span> is not a WordPress or Shopify site.
          </>
        ) : (
          "Connect a WordPress or Shopify website to use Blog Agent."
        )}
      </p>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Support for additional platforms is coming soon.
      </p>
    </div>
  );
}

// ── OAuth callback reader ──────────────────────────────────────────────────────

function BlogAgentCallbackReader({
  onSuccess,
  onError,
}: {
  onSuccess: (provider: string) => void;
  onError: (msg: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const shopifyStatus = searchParams.get("shopify");
    const wordpressStatus = searchParams.get("wordpress");
    const reason = searchParams.get("reason");

    const friendlyReason = (r: string | null) => {
      if (!r) return "";
      const map: Record<string, string> = {
        expired_state: "Connection timed out. Please try again.",
        invalid_state: "Invalid session. Please try again.",
        invalid_hmac: "Security check failed. Please try again.",
        subscription_required: "Your plan does not support this integration.",
        token_exchange_failed: "Could not exchange the authorization code.",
        missing_access_token: "No access token received from provider.",
        shop_frozen: "This Shopify store is currently frozen.",
        oauth_not_configured: "OAuth is not configured on this server.",
      };
      return map[r] || `${r.replaceAll("_", " ")}.`;
    };

    if (shopifyStatus === "connected") {
      onSuccess("shopify");
    } else if (shopifyStatus === "error") {
      onError(`Shopify connection failed. ${friendlyReason(reason)}`);
    } else if (wordpressStatus === "connected") {
      onSuccess("wordpress");
    } else if (wordpressStatus === "error") {
      onError(`WordPress connection failed. ${friendlyReason(reason)}`);
    }

    if (shopifyStatus || wordpressStatus) {
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router, onSuccess, onError]);

  return null;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BlogAgentPage() {
  useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { run, loading: runLoading } = useRun();
  const email = session?.user?.email ?? "";

  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // WordPress form
  const [wpUrl, setWpUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpApiKey, setWpApiKey] = useState("");

  // Shopify form
  const [shopDomain, setShopDomain] = useState("");
  const [shopAccessToken, setShopAccessToken] = useState("");
  const [shopConnectMode, setShopConnectMode] = useState<"token" | "oauth">("token");

  function handleOAuthSuccess(provider: string) {
    setError("");
    setSuccess(`${provider === "shopify" ? "Shopify" : "WordPress"} connected successfully.`);
    getIntegrationStatus(email).then(setIntegrations).catch(() => {});
  }

  function handleOAuthError(msg: string) {
    setSuccess("");
    setError(msg);
  }

  useEffect(() => {
    if (!email) return;
    getIntegrationStatus(email)
      .then(setIntegrations)
      .catch(() => {})
      .finally(() => setLoadingIntegrations(false));
  }, [email]);

  const loading = runLoading || loadingIntegrations;
  const cms = detectCMS(run?.url, integrations);
  const connected = cms !== "unknown" && integrations.some(
    (i) => i.provider === cms && i.is_active,
  );
  const integration = getActiveIntegration(cms, integrations);
  const currentStep = connected ? 1 : 0;

  async function handleConnectWordPress(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !wpUrl) return;
    setConnecting(true);
    setError("");
    setSuccess("");
    try {
      const res = await connectWordPress(email, wpUrl.trim(), wpApiKey.trim(), window.location.pathname, wpUsername.trim() || undefined);
      if (res.oauth_url) {
        window.location.href = res.oauth_url;
        return;
      }
      const updated = await getIntegrationStatus(email);
      setIntegrations(updated);
      setSuccess("WordPress connected successfully.");
    } catch {
      setError("Failed to connect WordPress. Check your site URL and application password.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleConnectShopifyManual(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !shopDomain || !shopAccessToken) return;
    setConnecting(true);
    setError("");
    setSuccess("");
    try {
      await connectShopify(email, shopDomain.trim(), shopAccessToken.trim());
      const updated = await getIntegrationStatus(email);
      setIntegrations(updated);
      setSuccess("Shopify connected successfully.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to connect Shopify. Check your store domain and access token.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleConnectShopify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !shopDomain) return;
    setConnecting(true);
    setError("");
    setSuccess("");
    try {
      const res = await getShopifyAuthUrl(email, shopDomain.trim(), window.location.pathname);
      window.location.href = res.auth_url;
    } catch {
      setError("Failed to start Shopify connection. Check your store domain and try again.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!email) return;
    setDisconnecting(true);
    setError("");
    setSuccess("");
    try {
      if (cms === "wordpress") await disconnectWordPress(email);
      else if (cms === "shopify") await disconnectShopify(email);
      const updated = await getIntegrationStatus(email);
      setIntegrations(updated);
    } catch {
      setError("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="space-y-6 px-2 py-2 sm:px-0">
      <Suspense fallback={null}>
        <BlogAgentCallbackReader
          onSuccess={handleOAuthSuccess}
          onError={handleOAuthError}
        />
      </Suspense>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Blog Agent
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Connect your CMS and let Signalor generate and publish GEO-optimized blog content automatically.
          </p>
        </div>
        <a
          href="https://docs.signalor.ai/blog-agent"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View documentation"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
        >
          <Info className="size-4" />
        </a>
      </div>

      {/* Setup stepper */}
      <SetupStepper currentStep={currentStep} />

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {!loading && success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check className="size-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Main content */}
      {!loading && (
        <>
          {connected && run ? (
            <>
              <ConnectedCard
                cms={cms}
                integration={integration}
                runUrl={run.url}
                onDisconnect={handleDisconnect}
                disconnecting={disconnecting}
              />
              <BlogAutomationPanel
                email={email}
                runId={run.id}
                analyzedUrl={run.url ?? ""}
              />
            </>
          ) : cms === "unknown" ? (
            <>
              <CMSDetectionCard cms={cms} runUrl={run?.url} />
              <UnsupportedCMSCard runUrl={run?.url} />
            </>
          ) : (
            <>
              <CMSDetectionCard cms={cms} runUrl={run?.url} />
              {cms === "wordpress" && (
                <WordPressConnectCard
                  wpUrl={wpUrl}
                  setWpUrl={setWpUrl}
                  wpUsername={wpUsername}
                  setWpUsername={setWpUsername}
                  wpApiKey={wpApiKey}
                  setWpApiKey={setWpApiKey}
                  connecting={connecting}
                  onSubmit={handleConnectWordPress}
                />
              )}
              {cms === "shopify" && (
                <ShopifyConnectCard
                  shopDomain={shopDomain}
                  setShopDomain={setShopDomain}
                  accessToken={shopAccessToken}
                  setAccessToken={setShopAccessToken}
                  connectMode={shopConnectMode}
                  setConnectMode={setShopConnectMode}
                  connecting={connecting}
                  onSubmitToken={handleConnectShopifyManual}
                  onSubmitOAuth={handleConnectShopify}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
