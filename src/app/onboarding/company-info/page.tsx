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
import { startAnalysis } from "@/lib/api/analyzer";
import { getSubscriptionStatus } from "@/lib/api/payments";
import { config, routes } from "@/lib/config";
import {
  ONBOARDING_DRAFT_KEY,
  storePendingAnalysisAfterPayment,
} from "@/lib/internal-nav";
import axios from "axios";
import {
  Loader2, ArrowRight, ArrowLeft,
  Plus, X, Pencil, Sparkles, Rocket,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

type Step = "company" | "prompts" | "launch";

function formatOnboardError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Something went wrong. Please try again.";
  }
  const data = err.response?.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
    if (typeof o.detail === "string" && o.detail.trim()) return o.detail;
    for (const v of Object.values(o)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === "string") {
        return v[0];
      }
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Cannot reach the API. Start the backend (e.g. port 8000) and set NEXT_PUBLIC_API_URL in .env.local.";
  }
  if (err.response?.status === 403) {
    return "You can't create a workspace yet (subscription required or project limit). Subscribe or upgrade to Pro for more projects.";
  }
  if (err.response?.status && err.response.status >= 500) {
    return "Server error while creating workspace. Check backend logs.";
  }
  return err.message?.trim() || "Failed to create workspace.";
}

type OnboardingDraftV2 = {
  v: 2;
  email: string;
  step: Step;
  companyName: string;
  siteUrl: string;
  orgId: number | null;
  prompts: string[];
};

export default function CompanyInfoPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const hasAppliedStoredDraft = useRef(false);
  const [canPersistDraft, setCanPersistDraft] = useState(false);

  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [orgId, setOrgId] = useState<number | null>(null);

  // Prompts step
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(routes.signIn);
    }
  }, [isPending, session, router]);

  // Restore draft once
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email) return;
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
      const d = JSON.parse(raw);
      if (d.email !== session.user.email) {
        sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
        setCanPersistDraft(true);
        return;
      }
      setStep(d.step ?? "company");
      setCompanyName(d.companyName ?? "");
      setSiteUrl(d.siteUrl ?? "");
      setOrgId(d.orgId ?? null);
      setPrompts(Array.isArray(d.prompts) ? d.prompts : []);
    } catch {
      sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
    }
    setCanPersistDraft(true);
  }, [session?.user?.email]);

  // Persist draft
  useEffect(() => {
    if (typeof window === "undefined" || !session?.user?.email || !canPersistDraft) return;
    const draft: OnboardingDraftV2 = {
      v: 2,
      email: session.user.email,
      step,
      companyName,
      siteUrl,
      orgId,
      prompts,
    };
    try {
      sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
    } catch { /* quota / private mode */ }
  }, [canPersistDraft, session?.user?.email, step, companyName, siteUrl, orgId, prompts]);

  // ── Step handlers ──

  async function handleCompanyNext(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !siteUrl.trim() || !session) return;
    setLoading(true);
    setError("");
    setStatusMsg("Creating your workspace...");

    const email = session.user.email;
    let url = siteUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    setSiteUrl(url);

    try {
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
      setStep("prompts");
      generatePrompts(companyName.trim(), url);
    } catch (err) {
      setError(formatOnboardError(err));
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  }

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

  async function handleLaunch() {
    if (!session || !orgId) return;
    setLoading(true);
    setError("");
    setStatusMsg("Checking your plan...");

    try {
      const sub = await getSubscriptionStatus(session.user.email);
      if (!sub.is_active) {
        storePendingAnalysisAfterPayment({
          url: siteUrl,
          run_type: "single_page",
          email: session.user.email,
          brand_name: companyName.trim(),
          org_id: orgId,
        });
        setStatusMsg("");
        setLoading(false);
        const returnTo = encodeURIComponent(routes.onboardingCompanyInfo);
        router.push(`/pricing?returnTo=${returnTo}`);
        return;
      }

      setStatusMsg("Starting your GEO analysis...");
      const analysis = await startAnalysis({
        url: siteUrl,
        run_type: "single_page",
        email: session.user.email,
        brand_name: companyName.trim(),
        org_id: orgId,
      });
      try {
        sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch { /* ignore */ }
      router.push(routes.dashboardProject(analysis.slug));
    } catch (err) {
      setError(formatOnboardError(err));
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

  const stepNumber = { company: 1, prompts: 2, launch: 3 }[step];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <BackgroundBeams />
      <div className={`relative z-10 w-full ${step === "prompts" ? "max-w-2xl" : "max-w-lg"}`}>
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n <= stepNumber ? "w-8 bg-primary" : "w-4 bg-white/[0.1]"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Company name + URL */}
        {step === "company" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">Set up your workspace</CardTitle>
              <CardDescription>Tell us about your brand and we&apos;ll analyze your AI visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input id="company-name" placeholder="Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} required autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Website URL</Label>
                  <Input id="site-url" placeholder="acme.com" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} required />
                  <p className="text-xs text-muted-foreground">We&apos;ll crawl this URL to generate your GEO score</p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {statusMsg && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</div>}
                <Button type="submit" className="gradient-btn w-full" disabled={loading || !companyName.trim() || !siteUrl.trim()}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: AI-Generated Prompts */}
        {step === "prompts" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl w-full max-w-2xl">
            <CardHeader>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Step 2 / 3</p>
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
                            <div className="w-5 h-5 rounded-md border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span
                              className="flex-1 text-[15px] text-foreground leading-relaxed cursor-pointer"
                              onClick={() => handleEditPrompt(idx)}
                            >
                              {prompt}
                            </span>
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
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("company")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="gradient-btn flex-[2]" onClick={() => setStep("launch")} disabled={loadingPrompts || prompts.length === 0}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Launch Analysis */}
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
                  className="text-muted-foreground"
                  onClick={() => setStep("prompts")}
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
