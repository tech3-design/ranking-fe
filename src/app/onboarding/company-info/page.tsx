"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createOrganization } from "@/lib/api/organizations";
import {
  getShopifyAuthUrl,
  connectWordPress,
  getGAAuthUrl,
} from "@/lib/api/integrations";
import { startAnalysis } from "@/lib/api/analyzer";
import { config, routes, signalorWpPlugin } from "@/lib/config";
import axios from "axios";
import {
  Loader2, ShoppingBag, Globe, ArrowLeft, ArrowRight,
  Plus, X, Pencil, BarChart3, Sparkles, Rocket,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

type Platform = "shopify" | "wordpress" | null;
type Step = "company" | "platform" | "connect" | "prompts" | "analytics" | "launch";

const ONBOARDING_DRAFT_KEY = "signalor_onboarding_draft";

type OnboardingDraftV1 = {
  v: 1;
  email: string;
  step: Step;
  companyName: string;
  platform: Platform;
  shopDomain: string;
  storePassword: string;
  wpSiteUrl: string;
  wpApiKey: string;
  wpStep: number;
  orgId: number | null;
  siteUrl: string;
  prompts: string[];
};

export default function CompanyInfoPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const skipDraftHydration = useRef(false);
  /** Only apply sessionStorage draft once per mount so session refetch can't reset step (e.g. Back from GA → company). */
  const hasAppliedStoredDraft = useRef(false);
  const [canPersistDraft, setCanPersistDraft] = useState(false);

  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [platform, setPlatform] = useState<Platform>(null);

  // Shopify fields
  const [shopDomain, setShopDomain] = useState("");
  const [storePassword, setStorePassword] = useState("");

  // WordPress fields
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpApiKey, setWpApiKey] = useState("");
  const [wpStep, setWpStep] = useState(1); // 1=download, 2=upload, 3=api key

  // Org created after connect
  const [orgId, setOrgId] = useState<number | null>(null);
  const [siteUrl, setSiteUrl] = useState("");

  // Prompts step
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [newPrompt, setNewPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(routes.signIn);
    }
  }, [isPending, session, router]);

  // Restore draft once before paint (refresh / return) — never re-apply on session refetch (fixes Back: GA → company).
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email) return;

    const params = new URLSearchParams(window.location.search);
    const shopifyResume =
      params.get("resume") === "shopify" || params.get("shopify") === "connected";
    if (shopifyResume && sessionStorage.getItem("signalor_onboarding")) {
      skipDraftHydration.current = true;
      setCanPersistDraft(true);
      return;
    }

    if (skipDraftHydration.current) {
      setCanPersistDraft(true);
      return;
    }

    if (hasAppliedStoredDraft.current) {
      setCanPersistDraft(true);
      return;
    }
    hasAppliedStoredDraft.current = true;

    try {
      const raw = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) {
        setCanPersistDraft(true);
        return;
      }
      const d = JSON.parse(raw) as OnboardingDraftV1;
      if (d.v !== 1 || d.email !== session.user.email) {
        sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
        setCanPersistDraft(true);
        return;
      }
      setStep(d.step);
      setCompanyName(d.companyName ?? "");
      setPlatform(d.platform ?? null);
      setShopDomain(d.shopDomain ?? "");
      setStorePassword(d.storePassword ?? "");
      setWpSiteUrl(d.wpSiteUrl ?? "");
      setWpApiKey(d.wpApiKey ?? "");
      setWpStep(d.wpStep ?? 1);
      setOrgId(d.orgId ?? null);
      setSiteUrl(d.siteUrl ?? "");
      setPrompts(Array.isArray(d.prompts) ? d.prompts : []);
    } catch {
      sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
    }
    setCanPersistDraft(true);
  }, [session?.user?.email]);

  // Persist draft whenever onboarding fields change (same tab / survive refresh)
  useEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email || !canPersistDraft) return;
    const draft: OnboardingDraftV1 = {
      v: 1,
      email: session.user.email,
      step,
      companyName,
      platform,
      shopDomain,
      storePassword,
      wpSiteUrl,
      wpApiKey,
      wpStep,
      orgId,
      siteUrl,
      prompts,
    };
    try {
      sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* quota / private mode */
    }
  }, [
    canPersistDraft,
    session?.user?.email,
    step,
    companyName,
    platform,
    shopDomain,
    storePassword,
    wpSiteUrl,
    wpApiKey,
    wpStep,
    orgId,
    siteUrl,
    prompts,
  ]);

  // ── Step handlers ──

  function handleCompanyNext(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError("");
    setStep("platform");
  }

  function handlePlatformSelect(p: Platform) {
    setPlatform(p);
    setError("");
    setStep("connect");
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setLoading(true);
    setError("");
    setStatusMsg("Creating your organization...");

    const email = session.user.email;

    try {
      let url =
        platform === "shopify"
          ? `https://${shopDomain.replace(/^https?:\/\//, "")}`
          : wpSiteUrl.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      setSiteUrl(url);

      // Create org
      let org;
      try {
        org = await createOrganization({ name: companyName.trim(), url, email });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          org = err.response.data;
        } else {
          throw err;
        }
      }
      setOrgId(org?.id);

      // Connect integration
      if (platform === "shopify") {
        const domain = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
        // For Shopify, OAuth redirects away — we need to come back to the prompts step
        // Store state in sessionStorage so we can resume after OAuth
        sessionStorage.setItem("signalor_onboarding", JSON.stringify({
          step: "prompts",
          companyName: companyName.trim(),
          orgId: org?.id,
          siteUrl: url,
          platform: "shopify",
        }));

        const { auth_url } = await getShopifyAuthUrl(
          email, domain, "/onboarding/company-info?resume=shopify", org?.id, storePassword || undefined,
        );
        window.location.href = auth_url;
        return;
      }

      if (platform === "wordpress") {
        let wpUrl = wpSiteUrl.trim();
        if (!wpUrl.startsWith("http://") && !wpUrl.startsWith("https://")) {
          wpUrl = `https://${wpUrl}`;
        }

        setStatusMsg("Connecting to your WordPress site...");
        await connectWordPress(email, wpUrl, wpApiKey.trim(), "");
      }

      // Move to prompts step
      setStep("prompts");
      generatePrompts(companyName.trim(), url);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.detail || "Connection failed.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStatusMsg("");
    } finally {
      setLoading(false);
    }
  }

  // Resume after OAuth redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") === "shopify" || params.get("shopify") === "connected") {
      const saved = sessionStorage.getItem("signalor_onboarding");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          skipDraftHydration.current = true;
          setCompanyName(data.companyName || "");
          setOrgId(data.orgId);
          setSiteUrl(data.siteUrl || "");
          setPlatform(data.platform || "shopify");
          setStep("prompts");
          generatePrompts(data.companyName, data.siteUrl);
          sessionStorage.removeItem("signalor_onboarding");
          // Clean URL
          window.history.replaceState({}, "", "/onboarding/company-info");
        } catch { /* ignore */ }
      }
    }
  }, []);

  async function generatePrompts(brand: string, url: string) {
    setLoadingPrompts(true);
    try {
      const resp = await fetch(`${config.apiBaseUrl}/api/analyzer/generate-prompts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_name: brand, brand_url: url }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setPrompts(data.prompts || []);
      } else {
        // Fallback prompts
        setPrompts([
          `What are the best ${brand} alternatives?`,
          `Is ${brand} worth it?`,
          `Compare ${brand} with competitors`,
          `What do experts say about ${brand}?`,
          `Best tools similar to ${brand}`,
        ]);
      }
    } catch {
      setPrompts([
        `What are the best tools in this space?`,
        `Which solution do experts recommend?`,
        `Compare the top options available`,
      ]);
    } finally {
      setLoadingPrompts(false);
    }
  }

  function handleRemovePrompt(idx: number) {
    setPrompts((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleEditPrompt(idx: number) {
    setEditingIdx(idx);
    setEditText(prompts[idx]);
  }

  function handleSaveEdit(idx: number) {
    if (editText.trim()) {
      setPrompts((prev) => prev.map((p, i) => (i === idx ? editText.trim() : p)));
    }
    setEditingIdx(null);
    setEditText("");
  }

  function handleAddPrompt() {
    if (newPrompt.trim() && prompts.length < 15) {
      setPrompts((prev) => [...prev, newPrompt.trim()]);
      setNewPrompt("");
    }
  }

  async function handleLaunch() {
    if (!session || !orgId) return;
    setLoading(true);
    setError("");
    setStatusMsg("Starting your GEO analysis...");

    try {
      const analysis = await startAnalysis({
        url: siteUrl,
        run_type: "single_page",
        email: session.user.email,
        brand_name: companyName.trim(),
        org_id: orgId,
      });
      try {
        sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(routes.dashboardProject(analysis.slug));
    } catch {
      setError("Failed to start analysis. Please try again.");
      setStatusMsg("");
      setLoading(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stepNumber = { company: 1, platform: 2, connect: 2, prompts: 3, analytics: 4, launch: 5 }[step];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <BackgroundBeams />
      <div className={`relative z-10 w-full ${step === "prompts" ? "max-w-2xl" : "max-w-lg"}`}>
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n <= stepNumber ? "w-8 bg-primary" : "w-4 bg-white/[0.1]"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Company name */}
        {step === "company" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">What&apos;s your company name?</CardTitle>
              <CardDescription>We&apos;ll use this to set up your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input id="company-name" placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} required autoFocus />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="gradient-btn w-full">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2a: Platform selection */}
        {step === "platform" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">Connect your store</CardTitle>
              <CardDescription>Choose your platform to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button type="button" onClick={() => handlePlatformSelect("shopify")} className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white/[0.03] p-4 text-left transition-all hover:border-emerald-500/40 hover:bg-white/[0.06]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#96bf48]/10"><ShoppingBag className="h-6 w-6 text-[#96bf48]" /></div>
                <div><p className="font-semibold">Shopify</p><p className="text-sm text-muted-foreground">Connect your Shopify store via OAuth</p></div>
              </button>
              <button type="button" onClick={() => handlePlatformSelect("wordpress")} className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white/[0.03] p-4 text-left transition-all hover:border-emerald-500/40 hover:bg-white/[0.06]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#21759b]/10"><Globe className="h-6 w-6 text-[#21759b]" /></div>
                <div><p className="font-semibold">WordPress</p><p className="text-sm text-muted-foreground">Connect your WordPress site</p></div>
              </button>
              <Button variant="ghost" className="w-full mt-2" onClick={() => setStep("company")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2b: Connect details (Shopify) */}
        {step === "connect" && platform === "shopify" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">Connect Shopify</CardTitle>
              <CardDescription>Enter your store domain</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-domain">Store domain</Label>
                  <Input id="shop-domain" placeholder="your-store.myshopify.com" value={shopDomain} onChange={(e) => setShopDomain(e.target.value)} required autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-password">Storefront password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="store-password" type="password" placeholder="Leave empty if not password-protected" value={storePassword} onChange={(e) => setStorePassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Dev stores have password protection enabled by default.</p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {statusMsg && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</div>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setStep("platform"); setError(""); }} disabled={loading}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                  <Button type="submit" className="gradient-btn flex-1" disabled={loading || !shopDomain.trim()}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : "Connect"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2b: Connect details (WordPress) */}
        {step === "connect" && platform === "wordpress" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">Connect WordPress</CardTitle>
              <CardDescription>We&apos;ll walk you through it step by step</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-5">
                {/* Site URL — always visible */}
                <div className="space-y-2">
                  <Label htmlFor="wp-url">Your WordPress site URL</Label>
                  <Input id="wp-url" placeholder="arkit.com" value={wpSiteUrl} onChange={(e) => { setWpSiteUrl(e.target.value); setWpStep(1); }} required autoFocus />
                </div>

                {/* Step 1: Download the plugin */}
                {wpSiteUrl.trim() && wpStep >= 1 && (
                  <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">1</span>
                      <p className="text-xs font-semibold text-foreground">Download the Signalor GEO plugin</p>
                    </div>
                    <a
                      href={signalorWpPlugin.zipPath}
                      download
                      onClick={() => setTimeout(() => setWpStep(2), 500)}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary/10 border border-primary/30 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                      Download signalor-geo.zip
                    </a>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <a
                        href={signalorWpPlugin.zipPathVersioned}
                        download
                        className="text-[11px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Or download v{signalorWpPlugin.version} (pinned)
                      </a>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload to their site */}
                {wpStep >= 2 && (
                  <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">2</span>
                      <p className="text-xs font-semibold text-foreground">Upload the plugin to your WordPress site</p>
                    </div>

                    <a
                      href={`${wpSiteUrl.trim().replace(/\/$/, "").replace(/^(?!https?:\/\/)/, "https://")}/wp-admin/plugin-install.php?tab=upload`}
                      target="_blank"
                      rel="noopener"
                      onClick={() => setTimeout(() => setWpStep(3), 1000)}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#21759b]/10 border border-[#21759b]/30 px-4 py-2.5 text-xs font-semibold text-[#21759b] hover:bg-[#21759b]/20 transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Open Upload Plugin Page
                    </a>

                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
                      <p className="text-[11px] text-muted-foreground">This opens your WordPress admin. After logging in:</p>
                      <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90">
                        If you tried before and saw a PHP error, go to <strong className="text-foreground">Plugins</strong>, delete any <strong className="text-foreground">Signalor GEO</strong> install (including folders like signalor-geo-1), then upload again.
                      </p>
                      <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
                        <li>Click <strong className="text-foreground">Choose File</strong> and select the <strong className="text-foreground">signalor-geo.zip</strong> you just downloaded</li>
                        <li>Click <strong className="text-foreground">Install Now</strong></li>
                        <li>After installation, click <strong className="text-foreground">Activate Plugin</strong></li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Step 3: Get API key */}
                {wpStep >= 3 && (
                  <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">3</span>
                      <p className="text-xs font-semibold text-foreground">Copy your API Key and paste it here</p>
                    </div>
                    <a
                      href={`${wpSiteUrl.trim().replace(/\/$/, "").replace(/^(?!https?:\/\/)/, "https://")}/wp-admin/options-general.php?page=signalor-geo`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-white/[0.06] border border-white/[0.12] px-4 py-2.5 text-xs font-medium text-foreground hover:bg-white/[0.1] transition"
                    >
                      Open Settings → Signalor GEO on your site
                    </a>
                    <Input id="wp-api-key" type="text" placeholder="Paste your API key here" value={wpApiKey} onChange={(e) => setWpApiKey(e.target.value)} required className="font-mono text-xs" />
                  </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}
                {statusMsg && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</div>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setStep("platform"); setError(""); setWpStep(1); }} disabled={loading}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                  <Button type="submit" className="gradient-btn flex-1" disabled={loading || !wpSiteUrl.trim() || !wpApiKey.trim()}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : "Connect"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: AI-Generated Prompts */}
        {step === "prompts" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl w-full max-w-2xl">
            <CardHeader>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Step 3 / 5</p>
              <CardTitle className="text-xl font-bold text-foreground mt-1">Review Prompts</CardTitle>
              <CardDescription className="text-sm">
                We&apos;ll track these prompts across AI engines to see how they mention {companyName || "your brand"}. You can add or remove prompts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {loadingPrompts ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating prompts for {companyName}...</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Select prompts</p>
                    <span className="text-xs text-muted-foreground">{prompts.length} / 15</span>
                  </div>

                  {/* Prompt list */}
                  <div className="space-y-0 divide-y divide-white/[0.06] border border-white/[0.1] rounded-xl overflow-hidden">
                    {prompts.map((prompt, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-5 py-4 bg-white/[0.02] hover:bg-white/[0.05] transition group">
                        {editingIdx === idx ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 text-sm h-9"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(idx); if (e.key === "Escape") setEditingIdx(null); }}
                            />
                            <button onClick={() => handleSaveEdit(idx)} className="text-xs text-primary font-semibold px-3 py-1 rounded-lg hover:bg-primary/10 transition">Save</button>
                            <button onClick={() => setEditingIdx(null)} className="text-xs text-muted-foreground px-2">Cancel</button>
                          </div>
                        ) : (
                          <>
                            {/* Checkbox */}
                            <div className="w-5 h-5 rounded-md border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>

                            {/* Prompt text */}
                            <span
                              className="flex-1 text-[15px] text-foreground leading-relaxed cursor-pointer"
                              onClick={() => handleEditPrompt(idx)}
                            >
                              {prompt}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => handleEditPrompt(idx)} className="p-1.5 rounded-lg hover:bg-white/[0.1] transition" title="Edit">
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => handleRemovePrompt(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition" title="Remove">
                                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add custom */}
                  <button
                    type="button"
                    onClick={() => {
                      if (prompts.length < 15) {
                        setPrompts((prev) => [...prev, ""]);
                        setEditingIdx(prompts.length);
                        setEditText("");
                      }
                    }}
                    disabled={prompts.length >= 15}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-white/[0.15] text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                    Add custom prompt
                  </button>
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("connect")}>
                  Back
                </Button>
                <Button className="gradient-btn flex-[2]" onClick={() => setStep("analytics")} disabled={loadingPrompts || prompts.length === 0}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Google Analytics */}
        {step === "analytics" && (
          <Card className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("launch");
              }}
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
              aria-label="Skip Google Analytics"
            >
              <X className="h-4 w-4" />
            </button>
            <CardHeader className="text-center pt-8 sm:pt-6">
              <div className="mx-auto w-10 h-10 rounded-xl bg-[#F9AB00]/10 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-[#F9AB00]" />
              </div>
              <CardTitle className="gradient-text text-2xl">Google Analytics</CardTitle>
              <CardDescription>Connect Google Analytics to track how AI visibility affects your traffic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                className="gradient-btn flex w-full h-auto min-h-[3.25rem] flex-row items-center justify-start py-3 gap-3"
                disabled={loading}
                onClick={async () => {
                  if (!session) return;
                  setLoading(true);
                  setError("");
                  try {
                    const { auth_url } = await getGAAuthUrl(session.user.email);
                    window.location.href = auth_url;
                  } catch {
                    setError("Failed to connect Google Analytics.");
                    setLoading(false);
                  }
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-white" />
                  )}
                </div>
                <span className="flex flex-col items-start text-left">
                  <span className="font-semibold">
                    {loading ? "Redirecting…" : "Connect Google Analytics"}
                  </span>
                  <span className="text-xs font-normal opacity-90">
                    See traffic changes after GEO improvements
                  </span>
                </span>
              </Button>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setStep("prompts");
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Launch Analysis */}
        {step === "launch" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="gradient-text text-2xl">Ready to Launch!</CardTitle>
              <CardDescription>
                We&apos;ll analyze <strong className="text-foreground">{siteUrl}</strong> across 6 AI visibility pillars and generate your GEO score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="text-foreground font-medium">{companyName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="text-foreground font-medium capitalize">{platform}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Prompts</span>
                  <span className="text-foreground font-medium">{prompts.length} tracked</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">URL</span>
                  <span className="text-foreground font-medium text-right truncate ml-4">{siteUrl}</span>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {statusMsg && <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</div>}

              <div className="flex flex-col gap-2">
                <Button className="gradient-btn w-full" onClick={handleLaunch} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Rocket className="mr-2 h-4 w-4" /> Start GEO Analysis</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep("analytics")}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
