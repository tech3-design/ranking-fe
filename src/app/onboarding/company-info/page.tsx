"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization } from "@/lib/api/organizations";
import { startAnalysis } from "@/lib/api/analyzer";
import { getSubscriptionStatus } from "@/lib/api/payments";
import {
  getShopifyAuthUrl,
  connectWordPress,
} from "@/lib/api/integrations";
import { config, routes, signalorWpPlugin } from "@/lib/config";
import {
  ONBOARDING_DRAFT_KEY,
  storePendingAnalysisAfterPayment,
} from "@/lib/internal-nav";
import axios from "axios";
import {
  Loader2, ArrowRight, ArrowLeft, ShoppingBag, Globe,
  Plus, X, Pencil, Rocket,
} from "lucide-react";

type Platform = "shopify" | "wordpress";
type Step = "company" | "platform" | "connect" | "prompts" | "launch";

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
  v: 4; email: string; step: Step; companyName: string; platform: Platform;
  siteUrl: string; shopDomain: string; storePassword: string;
  wpSiteUrl: string; wpApiKey: string; wpStep: number;
  orgId: number | null; prompts: string[];
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
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { if (!isPending && !session) router.replace(routes.signIn); }, [isPending, session, router]);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email) return;
    const p = new URLSearchParams(window.location.search);
    if ((p.get("resume") === "shopify" || p.get("shopify") === "connected") && sessionStorage.getItem("signalor_onboarding")) {
      try {
        const d = JSON.parse(sessionStorage.getItem("signalor_onboarding")!);
        skipDraft.current = true;
        setCompanyName(d.companyName || ""); setOrgId(d.orgId); setSiteUrl(d.siteUrl || "");
        setPlatform("shopify"); setStep("prompts"); genPrompts(d.companyName, d.siteUrl);
        sessionStorage.removeItem("signalor_onboarding");
        window.history.replaceState({}, "", "/onboarding/company-info");
      } catch { /**/ }
      setCanPersist(true); return;
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
    } catch { sessionStorage.removeItem(ONBOARDING_DRAFT_KEY); }
    setCanPersist(true);
  }, [session?.user?.email]);

  useEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email || !canPersist) return;
    const draft: Draft = { v: 4, email: session.user.email, step, companyName, platform, siteUrl, shopDomain, storePassword, wpSiteUrl, wpApiKey, wpStep, orgId, prompts };
    try { sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft)); } catch { /**/ }
  }, [canPersist, session?.user?.email, step, companyName, platform, siteUrl, shopDomain, storePassword, wpSiteUrl, wpApiKey, wpStep, orgId, prompts]);

  function handleCompanyNext(e: React.FormEvent) { e.preventDefault(); if (!companyName.trim()) return; setError(""); setStep("platform"); }

  function handlePlatformSelect(p: Platform) { setPlatform(p); setError(""); setStep("connect"); }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault(); if (!session) return;
    setLoading(true); setError(""); setStatusMsg("Setting up...");
    const email = session.user.email;
    let url = platform === "shopify" ? `https://${shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : wpSiteUrl.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    setSiteUrl(url);
    try {
      let org;
      try { org = await createOrganization({ name: companyName.trim(), url, email }); }
      catch (err) { if (axios.isAxiosError(err) && err.response?.status === 409) org = err.response.data; else throw err; }
      setOrgId(org?.id);
      if (platform === "shopify") {
        sessionStorage.setItem("signalor_onboarding", JSON.stringify({ step: "prompts", companyName: companyName.trim(), orgId: org?.id, siteUrl: url }));
        const { auth_url } = await getShopifyAuthUrl(email, shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, ""), "/onboarding/company-info?resume=shopify", org?.id, storePassword || undefined);
        window.location.href = auth_url; return;
      }
      if (platform === "wordpress") { setStatusMsg("Connecting WordPress..."); await connectWordPress(email, url, wpApiKey.trim(), ""); }
      setStep("prompts"); genPrompts(companyName.trim(), url);
    } catch (err) { setError(fmtErr(err)); setStatusMsg(""); } finally { setLoading(false); }
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

  if (isPending || !session) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const sn = { company: 1, platform: 2, connect: 3, prompts: 4, launch: 5 }[step];

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
      <div className={`w-full ${step === "prompts" ? "max-w-xl" : "max-w-md"}`}>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`h-[3px] transition-all ${n <= sn ? "w-8 bg-foreground" : "w-4 bg-foreground/10"}`} />
          ))}
        </div>

        {/* ── Step 1: Company ── */}
        {step === "company" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">What&apos;s your brand?</h1>
              <p className="mt-2 text-[14px] text-muted-foreground tracking-[-0.01em]">We&apos;ll use this to set up your workspace</p>
            </div>
            <form onSubmit={handleCompanyNext} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-foreground tracking-[-0.01em]">Company name</Label>
                <Input placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} required autoFocus className="h-11 text-[14px] bg-white border-border" />
              </div>
              {error && <p className="text-[13px] text-destructive">{error}</p>}
              <button type="submit" disabled={!companyName.trim()} className="w-full h-11 bg-foreground text-background text-[14px] font-medium tracking-[-0.02em] transition hover:opacity-88 disabled:opacity-40">
                Continue <ArrowRight className="inline ml-1.5 w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Platform ── */}
        {step === "platform" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">Choose your platform</h1>
              <p className="mt-2 text-[14px] text-muted-foreground tracking-[-0.01em]">Connect to enable auto-fixes and deeper insights</p>
            </div>
            <div className="space-y-3 mb-6">
              {([
                { id: "shopify" as Platform, label: "Shopify", desc: "Connect via OAuth", icon: <ShoppingBag className="w-5 h-5" />, color: "#96bf48" },
                { id: "wordpress" as Platform, label: "WordPress", desc: "Connect via plugin", icon: <Globe className="w-5 h-5" />, color: "#21759b" },
              ]).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlatformSelect(p.id)}
                  className="flex w-full items-center gap-4 bg-white p-4 text-left transition-all hover:shadow-md"
                  style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 4px rgba(23,23,23,0.04)" }}
                >
                  <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}12` }}>
                    <span style={{ color: p.color }}>{p.icon}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-foreground tracking-[-0.01em]">{p.label}</p>
                    <p className="text-[12px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep("company")} className="flex items-center justify-center gap-1.5 w-full text-[13px] text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}

        {/* ── Step 3: Shopify Connect ── */}
        {step === "connect" && platform === "shopify" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">Connect Shopify</h1>
              <p className="mt-2 text-[14px] text-muted-foreground tracking-[-0.01em]">Enter your store domain</p>
            </div>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium tracking-[-0.01em]">Store domain</Label>
                <Input placeholder="your-store.myshopify.com" value={shopDomain} onChange={(e) => setShopDomain(e.target.value)} required autoFocus className="h-11 text-[14px] bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium tracking-[-0.01em]">Storefront password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input type="password" placeholder="Leave empty if not protected" value={storePassword} onChange={(e) => setStorePassword(e.target.value)} className="h-11 text-[14px] bg-white" />
              </div>
              {error && <p className="text-[13px] text-destructive">{error}</p>}
              {statusMsg && <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep("platform"); setError(""); }} className="flex-1 h-11 border border-border text-[14px] font-medium text-foreground bg-white transition hover:bg-muted">
                  <ArrowLeft className="inline mr-1.5 w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading || !shopDomain.trim()} className="flex-[2] h-11 bg-foreground text-background text-[14px] font-medium tracking-[-0.02em] transition hover:opacity-88 disabled:opacity-40">
                  {loading ? <><Loader2 className="inline mr-1.5 w-4 h-4 animate-spin" /> Connecting...</> : <>Connect <ArrowRight className="inline ml-1.5 w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 3: WordPress Connect ── */}
        {step === "connect" && platform === "wordpress" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">Connect WordPress</h1>
              <p className="mt-2 text-[14px] text-muted-foreground tracking-[-0.01em]">Install our plugin and connect</p>
            </div>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium tracking-[-0.01em]">Site URL</Label>
                <Input placeholder="yoursite.com" value={wpSiteUrl} onChange={(e) => { setWpSiteUrl(e.target.value); setWpStep(1); }} required autoFocus className="h-11 text-[14px] bg-white" />
              </div>

              {wpSiteUrl.trim() && wpStep >= 1 && (
                <div className="bg-white p-4 space-y-3" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                  <p className="text-[12px] font-medium text-foreground flex items-center gap-2"><span className="w-5 h-5 bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0">1</span> Download plugin</p>
                  <a href={signalorWpPlugin.zipPath} download onClick={() => setTimeout(() => setWpStep(2), 500)} className="block text-center bg-muted py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/5">
                    Download signalor-geo.zip
                  </a>
                </div>
              )}
              {wpStep >= 2 && (
                <div className="bg-white p-4 space-y-3" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                  <p className="text-[12px] font-medium text-foreground flex items-center gap-2"><span className="w-5 h-5 bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0">2</span> Upload & activate</p>
                  <a href={`${wpSiteUrl.trim().replace(/\/$/, "").replace(/^(?!https?:\/\/)/, "https://")}/wp-admin/plugin-install.php?tab=upload`} target="_blank" rel="noopener" onClick={() => setTimeout(() => setWpStep(3), 1000)} className="block text-center bg-muted py-2.5 text-[13px] font-medium text-foreground transition hover:bg-foreground/5">
                    Open WP Plugin Upload
                  </a>
                </div>
              )}
              {wpStep >= 3 && (
                <div className="bg-white p-4 space-y-3" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                  <p className="text-[12px] font-medium text-foreground flex items-center gap-2"><span className="w-5 h-5 bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0">3</span> Paste API key</p>
                  <Input type="text" placeholder="API key from Settings → Signalor GEO" value={wpApiKey} onChange={(e) => setWpApiKey(e.target.value)} required className="h-10 text-[13px] font-mono bg-white" />
                </div>
              )}

              {error && <p className="text-[13px] text-destructive">{error}</p>}
              {statusMsg && <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep("platform"); setError(""); setWpStep(1); }} className="flex-1 h-11 border border-border text-[14px] font-medium text-foreground bg-white transition hover:bg-muted">
                  <ArrowLeft className="inline mr-1.5 w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading || !wpSiteUrl.trim() || !wpApiKey.trim()} className="flex-[2] h-11 bg-foreground text-background text-[14px] font-medium tracking-[-0.02em] transition hover:opacity-88 disabled:opacity-40">
                  {loading ? <><Loader2 className="inline mr-1.5 w-4 h-4 animate-spin" /> Connecting...</> : <>Connect <ArrowRight className="inline ml-1.5 w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 4: Prompts ── */}
        {step === "prompts" && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">Review prompts</h1>
              <p className="mt-2 text-[14px] text-muted-foreground tracking-[-0.01em]">
                We&apos;ll track these across AI engines for <span className="text-foreground font-medium">{companyName}</span>
              </p>
            </div>

            {loadingPrompts ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                <p className="text-[13px] text-muted-foreground">Generating prompts...</p>
              </div>
            ) : (
              <>
                <div className="bg-white overflow-hidden mb-4" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 4px rgba(23,23,23,0.04)" }}>
                  {prompts.map((prompt, idx) => (
                    <div key={idx} className={`flex items-center gap-3 px-4 py-2.5 group transition hover:bg-muted/50 ${idx > 0 ? "border-t border-border" : ""}`}>
                      {editingIdx === idx ? (
                        <div className="flex-1 flex gap-2">
                          <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 text-[13px] h-8 bg-white" autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(idx); if (e.key === "Escape") setEditingIdx(null); }} />
                          <button onClick={() => saveEdit(idx)} className="text-[12px] font-medium text-foreground px-2 hover:underline">Save</button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[11px] font-mono text-muted-foreground w-4 text-right shrink-0">{idx + 1}</span>
                          <span className="flex-1 text-[13px] text-foreground tracking-[-0.01em] cursor-pointer truncate" onClick={() => editPrompt(idx)}>{prompt}</span>
                          <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition shrink-0">
                            <button onClick={() => editPrompt(idx)} className="p-1 transition hover:bg-muted"><Pencil className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={() => rmPrompt(idx)} className="p-1 transition hover:bg-red-50"><X className="w-3 h-3 text-muted-foreground" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => { if (prompts.length < 15) { setPrompts((p) => [...p, ""]); setEditingIdx(prompts.length); setEditText(""); } }} disabled={prompts.length >= 15} className="flex items-center gap-2 w-full px-4 py-2.5 border border-dashed border-border bg-white text-[13px] text-muted-foreground hover:text-foreground transition mb-6 disabled:opacity-30">
                  <Plus className="w-3.5 h-3.5" /> Add prompt
                </button>
              </>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("connect")} className="flex-1 h-11 border border-border text-[14px] font-medium text-foreground bg-white transition hover:bg-muted">
                <ArrowLeft className="inline mr-1.5 w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep("launch")} disabled={loadingPrompts || prompts.length === 0} className="flex-[2] h-11 bg-foreground text-background text-[14px] font-medium tracking-[-0.02em] transition hover:opacity-88 disabled:opacity-40">
                Continue <ArrowRight className="inline ml-1.5 w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Launch ── */}
        {step === "launch" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">Launch analysis</h1>
              <p className="mt-2 text-[14px] text-muted-foreground tracking-[-0.01em]">
                Scanning <span className="text-foreground font-medium">{siteUrl.replace(/^https?:\/\//, "")}</span> across 6 pillars
              </p>
            </div>

            <div className="bg-white overflow-hidden mb-6" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 4px rgba(23,23,23,0.04)" }}>
              {[
                { k: "Brand", v: companyName },
                { k: "Platform", v: platform.charAt(0).toUpperCase() + platform.slice(1) },
                { k: "Prompts", v: `${prompts.length} tracked` },
              ].map((r, i) => (
                <div key={r.k} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                  <span className="text-[13px] text-muted-foreground">{r.k}</span>
                  <span className="text-[13px] font-medium text-foreground">{r.v}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {["Content", "Schema", "E-E-A-T", "Technical", "Entity", "AI Visibility"].map((n) => (
                <span key={n} className="text-[11px] font-medium tracking-[-0.01em] px-3 py-1.5 text-muted-foreground bg-white" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>{n}</span>
              ))}
            </div>

            {error && <p className="text-[13px] text-destructive mb-3 text-center">{error}</p>}
            {statusMsg && <p className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground mb-3"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</p>}

            <button onClick={handleLaunch} disabled={loading} className="w-full h-12 bg-foreground text-background text-[15px] font-medium tracking-[-0.02em] transition hover:opacity-88 disabled:opacity-40">
              {loading ? <><Loader2 className="inline mr-2 w-4 h-4 animate-spin" /> Analyzing...</> : <><Rocket className="inline mr-2 w-4 h-4" /> Launch Analysis</>}
            </button>

            <button type="button" onClick={() => setStep("prompts")} disabled={loading} className="flex items-center justify-center gap-1.5 w-full mt-4 text-[13px] text-muted-foreground hover:text-foreground transition disabled:opacity-50">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
