"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization } from "@/lib/api/organizations";
import { startAnalysis } from "@/lib/api/analyzer";
import { getSubscriptionStatus } from "@/lib/api/payments";
import {
  getShopifyAuthUrl,
  connectWordPress,
} from "@/lib/api/integrations";
import { OnboardingStepper } from "@/components/auth/onboarding-stepper";
import { config, routes, signalorWpPlugin } from "@/lib/config";
import {
  ONBOARDING_DRAFT_KEY,
  storePendingAnalysisAfterPayment,
} from "@/lib/internal-nav";
import axios from "axios";
import {
  Loader2, ArrowRight, ArrowLeft, ShoppingBag, Globe,
  Plus, X, Pencil, Rocket, Download, ExternalLink,
  CheckCircle2, BarChart3,
} from "lucide-react";

type Platform = "shopify" | "wordpress";
type Step = "company" | "platform" | "url" | "install" | "prompts" | "analytics" | "launch";

const STEP_ORDER: Step[] = [
  "company",
  "platform",
  "url",
  "install",
  "prompts",
  "analytics",
  "launch",
];

const STEP_HERO: Record<Step, { headline: string; sub: string }> = {
  company: {
    headline: "Set up your workspace",
    sub: "Tell us your brand name — we use it for your project and default prompts.",
  },
  platform: {
    headline: "Choose your platform",
    sub: "Connect your stack for auto-fixes, schema, and deeper GEO insights.",
  },
  url: { headline: "", sub: "" },
  install: {
    headline: "Connect your site",
    sub: "Install the integration now or skip and add it later from settings.",
  },
  prompts: {
    headline: "Review prompts",
    sub: "We track these queries across AI engines for your brand.",
  },
  analytics: {
    headline: "Connect Analytics",
    sub: "Optional — link Google Analytics to see AI referral traffic.",
  },
  launch: {
    headline: "Launch analysis",
    sub: "We scan your site across six GEO pillars.",
  },
};

/** Nested panels inside the main card (install blocks, prompts list, etc.) */
const PANEL =
  "rounded-xl border border-black/8 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.045)]";

const ERR_BOX =
  "rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[12px] font-medium text-destructive";

const STATUS_BOX =
  "flex items-center gap-2 rounded-md border border-black/6 bg-muted/35 px-3 py-2 text-[12px] text-muted-foreground";

const STEP_CONTENT: Record<Step, { title: string; description: string }> = {
  company: { title: "", description: "" },
  platform: {
    title: "Shopify or WordPress",
    description: "Pick where your storefront or site is hosted.",
  },
  url: {
    title: "Project URL",
    description: "This becomes your primary site URL in Signalor.",
  },
  install: {
    title: "Install or skip",
    description: "OAuth or plugin unlocks auto-fixes; you can finish later.",
  },
  prompts: {
    title: "Tracking prompts",
    description: "Tap a prompt to edit, or add your own.",
  },
  analytics: {
    title: "Google Analytics",
    description: "Measure sessions referred from ChatGPT, Perplexity, and more.",
  },
  launch: {
    title: "Summary",
    description: "Confirm details, then start your first scan.",
  },
};

function fmtErr(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Something went wrong. Please try again.";
  const d = err.response?.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const o = d as Record<string, unknown>;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
    if (typeof o.detail === "string" && o.detail.trim()) return o.detail;
  }
  if (err.code === "ERR_NETWORK") return "Cannot reach the API.";
  if (err.response?.status === 403) return "Subscription required or project limit.";
  return "Failed. Please try again.";
}

type Draft = {
  v: 5; email: string; step: Step; companyName: string; platform: Platform;
  siteUrl: string; shopDomain: string; storePassword: string;
  wpSiteUrl: string; wpApiKey: string; wpStep: number;
  orgId: number | null; prompts: string[]; appInstalled: boolean;
};

export default function CompanyInfoPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const applied = useRef(false);
  const skipDraft = useRef(false);
  const [canPersist, setCanPersist] = useState(false);

  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [platform, setPlatform] = useState<Platform>("shopify");
  const [siteUrl, setSiteUrl] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpApiKey, setWpApiKey] = useState("");
  const [wpStep, setWpStep] = useState(1);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { if (!isPending && !session) router.replace(routes.signIn); }, [isPending, session, router]);

  // Handle return from Shopify OAuth / app install
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email) return;
    const p = new URLSearchParams(window.location.search);

    // Return from Shopify app install
    if (p.get("shopify") === "installed" || p.get("resume") === "shopify") {
      try {
        const saved = sessionStorage.getItem("signalor_onboarding");
        if (saved) {
          const d = JSON.parse(saved);
          skipDraft.current = true;
          setCompanyName(d.companyName || "");
          setOrgId(d.orgId);
          setSiteUrl(d.siteUrl || "");
          setShopDomain(d.shopDomain || "");
          setPlatform("shopify");
          setAppInstalled(true);
          setStep("prompts");
          genPrompts(d.companyName, d.siteUrl);
          sessionStorage.removeItem("signalor_onboarding");
        }
      } catch { /**/ }
      window.history.replaceState({}, "", "/onboarding/company-info");
      setCanPersist(true);
      return;
    }

    if (skipDraft.current || applied.current) { setCanPersist(true); return; }
    applied.current = true;
    try {
      const raw = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) { setCanPersist(true); return; }
      const d = JSON.parse(raw);
      if (d.email !== session.user.email) { sessionStorage.removeItem(ONBOARDING_DRAFT_KEY); setCanPersist(true); return; }
      setStep(d.step ?? "company"); setCompanyName(d.companyName ?? ""); setPlatform(d.platform ?? "shopify");
      setSiteUrl(d.siteUrl ?? ""); setShopDomain(d.shopDomain ?? ""); setStorePassword(d.storePassword ?? "");
      setWpSiteUrl(d.wpSiteUrl ?? ""); setWpApiKey(d.wpApiKey ?? ""); setWpStep(d.wpStep ?? 1);
      setOrgId(d.orgId ?? null); setPrompts(Array.isArray(d.prompts) ? d.prompts : []);
      setAppInstalled(d.appInstalled ?? false);
    } catch { sessionStorage.removeItem(ONBOARDING_DRAFT_KEY); }
    setCanPersist(true);
  }, [session?.user?.email]);

  // Persist draft
  useEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email || !canPersist) return;
    const draft: Draft = { v: 5, email: session.user.email, step, companyName, platform, siteUrl, shopDomain, storePassword, wpSiteUrl, wpApiKey, wpStep, orgId, prompts, appInstalled };
    try { sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft)); } catch { /**/ }
  }, [canPersist, session?.user?.email, step, companyName, platform, siteUrl, shopDomain, storePassword, wpSiteUrl, wpApiKey, wpStep, orgId, prompts, appInstalled]);

  function handleCompanyNext(e: React.FormEvent) { e.preventDefault(); if (!companyName.trim()) return; setError(""); setStep("platform"); }

  function handlePlatformSelect(p: Platform) { setPlatform(p); setError(""); setStep("url"); }

  // Step 3: Save URL + create org, move to install step
  async function handleUrlNext(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setLoading(true); setError(""); setStatusMsg("Setting up project...");
    const email = session.user.email;

    try {
      let url: string;
      if (platform === "shopify") {
        const domain = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
        url = `https://${domain}`;
      } else {
        url = wpSiteUrl.trim();
        if (!url.startsWith("http")) url = `https://${url}`;
      }
      setSiteUrl(url);

      // Create org
      let org;
      try { org = await createOrganization({ name: companyName.trim(), url, email }); }
      catch (err) { if (axios.isAxiosError(err) && err.response?.status === 409) org = err.response.data; else throw err; }
      setOrgId(org?.id);

      if (platform === "shopify") {
        setStep("install");
      } else {
        // WordPress goes to install step too (plugin install)
        setStep("install");
      }
    } catch (err) { setError(fmtErr(err)); }
    finally { setLoading(false); setStatusMsg(""); }
  }

  // Shopify: redirect to install app via OAuth
  async function handleShopifyInstall() {
    if (!session) return;
    setLoading(true); setError(""); setStatusMsg("Redirecting to Shopify...");
    const email = session.user.email;
    const domain = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");

    try {
      // Save state before redirect
      sessionStorage.setItem("signalor_onboarding", JSON.stringify({
        companyName: companyName.trim(),
        orgId,
        siteUrl,
        shopDomain: domain,
      }));

      // Get OAuth URL from backend (this also creates the Integration)
      const resp = await getShopifyAuthUrl(
        email,
        domain,
        "/onboarding/company-info?shopify=installed",
        orgId ?? undefined,
        storePassword || undefined,
      );

      if (!resp.auth_url) {
        setError("No auth URL returned. Check backend configuration.");
        setLoading(false); setStatusMsg("");
        return;
      }

      window.location.href = resp.auth_url;
    } catch (err) {
      setError(fmtErr(err));
      setLoading(false);
      setStatusMsg("");
    }
  }

  // WordPress: connect after plugin installed
  async function handleWordPressConnect() {
    if (!session) return;
    setLoading(true); setError(""); setStatusMsg("Connecting WordPress...");
    try {
      await connectWordPress(session.user.email, siteUrl, wpApiKey.trim(), "");
      setAppInstalled(true);
      setStep("prompts");
      genPrompts(companyName.trim(), siteUrl);
    } catch (err) { setError(fmtErr(err)); }
    finally { setLoading(false); setStatusMsg(""); }
  }

  // Skip install step (user can install later)
  function handleSkipInstall() {
    setStep("prompts");
    genPrompts(companyName.trim(), siteUrl);
  }

  async function genPrompts(brand: string, url: string) {
    setLoadingPrompts(true);
    try {
      const r = await fetch(`${config.apiBaseUrl}/api/analyzer/generate-prompts/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand_name: brand, brand_url: url }) });
      if (r.ok) { const d = await r.json(); setPrompts(d.prompts || []); }
      else setPrompts([`What are the best ${brand} alternatives?`, `Is ${brand} worth it?`, `Compare ${brand} with competitors`, `What do experts say about ${brand}?`, `Best tools similar to ${brand}`]);
    } catch { setPrompts([`Best tools in this space?`, `Which solution do experts recommend?`, `Compare top options`]); }
    finally { setLoadingPrompts(false); }
  }

  function rmPrompt(i: number) { setPrompts((p) => p.filter((_, j) => j !== i)); }
  function editPrompt(i: number) { setEditingIdx(i); setEditText(prompts[i]); }
  function saveEdit(i: number) { if (editText.trim()) setPrompts((p) => p.map((v, j) => j === i ? editText.trim() : v)); setEditingIdx(null); setEditText(""); }

  async function handleLaunch() {
    if (!session || !orgId) return;
    const promptList = prompts.map((p) => p.trim()).filter(Boolean);
    if (promptList.length < 1) { setError("Add at least one tracking prompt."); setStep("prompts"); return; }
    setLoading(true); setError(""); setStatusMsg("Checking plan...");
    try {
      const sub = await getSubscriptionStatus(session.user.email);
      if (!sub.is_active) {
        storePendingAnalysisAfterPayment({ url: siteUrl, run_type: "single_page", email: session.user.email, brand_name: companyName.trim(), org_id: orgId, prompts: promptList });
        setStatusMsg(""); setLoading(false);
        router.push(`/pricing?returnTo=${encodeURIComponent(routes.onboardingCompanyInfo)}`); return;
      }
      setStatusMsg("Starting analysis...");
      const a = await startAnalysis({ url: siteUrl, run_type: "single_page", email: session.user.email, brand_name: companyName.trim(), org_id: orgId, verify_org_workspace: true, prompts: promptList });
      try { sessionStorage.removeItem(ONBOARDING_DRAFT_KEY); } catch { /**/ }
      router.push(routes.dashboardProject(a.slug));
    } catch (err) { setError(fmtErr(err)); setStatusMsg(""); setLoading(false); }
  }

  const totalSteps = STEP_ORDER.length;
  const sn = STEP_ORDER.indexOf(step) + 1;
  const showStepDetail = step !== "company";
  const { title: stepTitle, description: stepDescription } = STEP_CONTENT[step];

  const hero =
    step === "url"
      ? platform === "shopify"
        ? {
            headline: "Your store URL",
            sub: "Enter your Shopify store domain (e.g. your-store.myshopify.com).",
          }
        : {
            headline: "Your website URL",
            sub: "Enter your public WordPress site address.",
          }
      : step === "install"
        ? platform === "shopify"
          ? {
              headline: "Install Signalor",
              sub: "Install the app on your store for schema, meta tags, and llms.txt.",
            }
          : {
              headline: "Install plugin",
              sub: "Add Signalor GEO in WordPress, then connect with your API key.",
            }
        : STEP_HERO[step];

  if (isPending || !session) {
    return (
      <div aria-busy="true" aria-live="polite">
        <OnboardingStepper current={sn} total={totalSteps} className="mb-5" />
        <CardHeader className="space-y-2 border-b border-black/6 px-0 pb-4 pt-0">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            <div className="flex items-center justify-between gap-2">
              <div>Loading</div>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                Step —/{totalSteps}
              </span>
            </div>
          </CardTitle>
          <CardDescription className="text-[13px] leading-relaxed text-muted-foreground">
            Checking your session…
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-3 px-0 py-14">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-[12px] text-muted-foreground">One moment</p>
        </CardContent>
      </div>
    );
  }

  return (
    <div>
      <OnboardingStepper current={sn} total={totalSteps} className="mb-5" />
      <CardHeader className="space-y-2 border-b border-black/6 px-0 pb-4 pt-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 leading-snug">{hero.headline}</span>
              <span className="shrink-0 pt-0.5 text-[11px] tabular-nums tracking-wide text-muted-foreground">
                Step {sn}/{totalSteps}
              </span>
            </div>
          </CardTitle>
          <CardDescription className="text-[13px] leading-relaxed text-muted-foreground">
            {hero.sub}
          </CardDescription>
          {/* {showStepDetail && (
            <div className="border-t border-black/6 pt-3">
              <p className="text-[13px] font-medium text-foreground">{stepTitle}</p>
              <CardDescription className="mt-0.5 text-[12px] leading-relaxed">
                {stepDescription}
              </CardDescription>
            </div>
          )} */}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-0 pt-5">
        {/* ── Step 1: Company ── */}
        {step === "company" && (
          <form onSubmit={handleCompanyNext} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-company" className="text-[12px] font-medium">
                Company name
              </Label>
              <Input
                id="onboarding-company"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                autoFocus
                className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
              />
            </div>
            {error ? <p className={ERR_BOX}>{error}</p> : null}
            <Button
              type="submit"
              disabled={!companyName.trim()}
              className="auth-cta-btn h-9 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* ── Step 2: Platform ── */}
        {step === "platform" && (
          <div className="space-y-3">
            <div className="space-y-3">
              {([
                { id: "shopify" as Platform, label: "Shopify", desc: "Connect via app install", icon: <ShoppingBag className="h-5 w-5" />, wrap: "bg-[#96bf48]/10", accent: "text-[#96bf48]" },
                { id: "wordpress" as Platform, label: "WordPress", desc: "Connect via plugin", icon: <Globe className="h-5 w-5" />, wrap: "bg-[#21759b]/10", accent: "text-[#21759b]" },
              ]).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlatformSelect(p.id)}
                  className="flex w-full items-center gap-4 rounded-xl border border-black/8 bg-white p-4 text-left shadow-[0_2px_14px_rgba(0,0,0,0.045)] transition hover:border-black/12 hover:bg-neutral-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${p.wrap}`}>
                    <span className={p.accent}>{p.icon}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{p.label}</p>
                    <p className="text-[12px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-md border-neutral-200 bg-white text-[13px] font-medium"
              onClick={() => setStep("company")}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        )}

        {/* ── Step 3: Enter URL ── */}
        {step === "url" && platform === "shopify" && (
          <form onSubmit={handleUrlNext} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-shop-domain" className="text-[12px] font-medium">
                Store domain
              </Label>
              <Input
                id="onboarding-shop-domain"
                placeholder="your-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                required
                autoFocus
                className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-store-password" className="text-[12px] font-medium">
                Storefront password <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="onboarding-store-password"
                type="password"
                placeholder="Leave empty if not protected"
                value={storePassword}
                onChange={(e) => setStorePassword(e.target.value)}
                className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
              />
            </div>
            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("platform");
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !shopDomain.trim()}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "url" && platform === "wordpress" && (
          <form onSubmit={handleUrlNext} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-wp-url" className="text-[12px] font-medium">
                Site URL
              </Label>
              <Input
                id="onboarding-wp-url"
                placeholder="yoursite.com"
                value={wpSiteUrl}
                onChange={(e) => setWpSiteUrl(e.target.value)}
                required
                autoFocus
                className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
              />
            </div>
            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("platform");
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !wpSiteUrl.trim()}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Setting up…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 4: Install App ── */}
        {step === "install" && platform === "shopify" && (
          <div className="space-y-3">
            <p className="text-center text-[12px] text-muted-foreground">
              Store{" "}
              <span className="font-medium text-foreground">
                {shopDomain.replace(/^https?:\/\//, "").replace(/\.myshopify\.com$/, "")}
              </span>
            </p>

            <div className={`${PANEL} p-5`}>
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#96bf48]/10">
                  <ShoppingBag className="h-5 w-5 text-[#96bf48]" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-medium text-foreground">Signalor GEO for Shopify</p>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    This installs our app on your store to enable auto-fixes, schema injection, AI meta tags, and
                    llms.txt generation.
                  </p>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                {[
                  "Auto-fix SEO & GEO issues directly on your store",
                  "Inject JSON-LD schema markup automatically",
                  "Add AI crawler meta tags for better visibility",
                  "Generate and serve llms.txt for AI discovery",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-[12px] text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={handleShopifyInstall}
                disabled={loading}
                className="auth-cta-btn flex h-9 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to Shopify…
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" /> Install on Shopify
                  </>
                )}
              </Button>
            </div>

            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("url");
                  setError("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                onClick={handleSkipInstall}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {step === "install" && platform === "wordpress" && (
          <div className="space-y-3">
            <div className="space-y-3">
              <div className={`${PANEL} p-4`}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-white">
                    1
                  </span>
                  <p className="text-[13px] font-medium text-foreground">Download the plugin</p>
                </div>
                <a
                  href={signalorWpPlugin.zipPath}
                  download
                  onClick={() => setTimeout(() => setWpStep(2), 500)}
                  className="flex w-full items-center justify-center gap-2 bg-muted py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/5"
                >
                  <Download className="h-3.5 w-3.5" /> Download signalor-geo.zip
                </a>
              </div>

              {wpStep >= 2 && (
                <div className={`${PANEL} p-4`}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-white">
                      2
                    </span>
                    <p className="text-[13px] font-medium text-foreground">Upload & activate in WordPress</p>
                  </div>
                  <a
                    href={`${siteUrl.replace(/\/$/, "")}/wp-admin/plugin-install.php?tab=upload`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setWpStep(3), 1000)}
                    className="flex w-full items-center justify-center gap-2 bg-muted py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open WP Plugin Upload
                  </a>
                </div>
              )}

              {wpStep >= 3 && (
                <div className={`${PANEL} p-4`}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-white">
                      3
                    </span>
                    <p className="text-[13px] font-medium text-foreground">Paste the API key</p>
                  </div>
                  <Input
                    type="text"
                    placeholder="API key from Settings > Signalor GEO"
                    value={wpApiKey}
                    onChange={(e) => setWpApiKey(e.target.value)}
                    className="h-9 rounded-md border-neutral-200 bg-white font-mono text-[13px]"
                  />
                </div>
              )}
            </div>

            {error ? <p className={ERR_BOX}>{error}</p> : null}
            {statusMsg ? (
              <p className={STATUS_BOX} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => {
                  setStep("url");
                  setError("");
                  setWpStep(1);
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {wpStep >= 3 && wpApiKey.trim() ? (
                <Button
                  type="button"
                  onClick={handleWordPressConnect}
                  disabled={loading}
                  className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
                    </>
                  ) : (
                    <>
                      Connect <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                  onClick={handleSkipInstall}
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 5: Prompts ── */}
        {step === "prompts" && (
          <div className="space-y-3">
            <p className="text-center text-[12px] text-muted-foreground">
              Brand <span className="font-medium text-foreground">{companyName}</span>
            </p>

            {loadingPrompts ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-[12px] text-muted-foreground">Generating prompts…</p>
              </div>
            ) : (
              <>
                <div className={`overflow-hidden ${PANEL}`}>
                  {prompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className={`group flex min-h-[44px] items-center gap-3 px-4 py-2.5 transition hover:bg-muted/50 ${idx > 0 ? "border-t border-border" : ""}`}
                    >
                      {editingIdx === idx ? (
                        <div className="flex flex-1 gap-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="h-8 flex-1 rounded-md border-neutral-200 bg-white text-[13px]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(idx);
                              if (e.key === "Escape") setEditingIdx(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            className="px-2 text-[12px] font-medium text-foreground hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="w-4 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span
                            className="flex-1 cursor-pointer truncate text-[13px] text-foreground"
                            onClick={() => editPrompt(idx)}
                          >
                            {prompt}
                          </span>
                          <div className="flex shrink-0 gap-0 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => editPrompt(idx)}
                              className="p-1 transition hover:bg-muted"
                              aria-label="Edit prompt"
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => rmPrompt(idx)}
                              className="p-1 transition hover:bg-red-50"
                              aria-label="Remove prompt"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={prompts.length >= 15}
                  onClick={() => {
                    if (prompts.length < 15) {
                      setPrompts((p) => [...p, ""]);
                      setEditingIdx(prompts.length);
                      setEditText("");
                    }
                  }}
                  className="mb-2 flex h-9 w-full items-center gap-2 rounded-md border-dashed border-neutral-200 bg-white text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" /> Add prompt
                </Button>
              </>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => setStep("install")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep("analytics")}
                disabled={loadingPrompts || prompts.length === 0}
                className="auth-cta-btn h-9 min-w-0 flex-[2] rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 6: Google Analytics ── */}
        {step === "analytics" && (
          <div className="space-y-3">
            <div className={`${PANEL} p-5`}>
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8710a]/10">
                  <BarChart3 className="h-5 w-5 text-[#e8710a]" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] font-medium text-foreground">Google Analytics</p>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    See how much traffic AI engines send to your site. Track referrals from ChatGPT, Gemini, Perplexity,
                    and more.
                  </p>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                {[
                  "Track AI referral traffic (ChatGPT, Perplexity, etc.)",
                  "Measure organic vs AI-driven sessions",
                  "Monitor conversion impact from AI visibility",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-[12px] text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => {
                  // TODO: implement GA OAuth connect
                  setStep("launch");
                }}
                className="auth-cta-btn flex h-9 w-full items-center justify-center gap-2 rounded-md text-[13px] font-medium text-white hover:text-white"
              >
                <ExternalLink className="h-4 w-4" /> Connect Google Analytics
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium"
                onClick={() => setStep("prompts")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-md border-neutral-200 bg-white text-[13px] font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setStep("launch")}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 7: Launch ── */}
        {step === "launch" && (
          <div className="space-y-3">
            <p className="text-center text-[12px] text-muted-foreground">
              Site{" "}
              <span className="font-medium text-foreground">{siteUrl.replace(/^https?:\/\//, "")}</span>
            </p>

            <div className={`mb-2 overflow-hidden ${PANEL}`}>
              {[
                { k: "Brand", v: companyName },
                { k: "Platform", v: platform.charAt(0).toUpperCase() + platform.slice(1) },
                { k: "App Installed", v: appInstalled ? "Yes" : "Not yet" },
                { k: "Prompts", v: `${prompts.length} tracked` },
              ].map((r, i) => (
                <div
                  key={r.k}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="text-[12px] text-muted-foreground">{r.k}</span>
                  <span
                    className={`text-[12px] font-medium ${r.k === "App Installed" && !appInstalled ? "text-amber-500" : "text-foreground"}`}
                  >
                    {r.v}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-2 flex flex-wrap justify-center gap-2">
              {["Content", "Schema", "E-E-A-T", "Technical", "Entity", "AI Visibility"].map((n) => (
                <span
                  key={n}
                  className="rounded-md border border-black/8 bg-white px-3 py-1.5 text-[11px] font-medium tracking-tight text-muted-foreground"
                >
                  {n}
                </span>
              ))}
            </div>

            {error ? <p className={`${ERR_BOX} text-center`}>{error}</p> : null}
            {statusMsg ? (
              <p className={`${STATUS_BOX} justify-center`} role="status">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                {statusMsg}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={handleLaunch}
              disabled={loading}
              className="auth-cta-btn h-10 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Launch analysis
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              className="h-9 w-full text-[13px] text-muted-foreground hover:text-foreground"
              onClick={() => setStep("analytics")}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-black/6 px-0 pb-0 pt-6">
        <p className="text-center text-[12px] text-muted-foreground">
          Different account?{" "}
          <Link
            href={routes.signIn}
            className="font-medium text-foreground underline decoration-neutral-300 underline-offset-2 hover:decoration-foreground"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </div>
  );
}
