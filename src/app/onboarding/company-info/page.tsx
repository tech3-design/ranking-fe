"use client";

import { useState, useEffect } from "react";
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
import { routes } from "@/lib/config";
import { config } from "@/lib/config";
import axios from "axios";
import {
  Loader2, ShoppingBag, Globe, ArrowLeft, ArrowRight,
  Plus, X, Pencil, BarChart3, Sparkles, Rocket,
} from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

type Platform = "shopify" | "wordpress" | null;
type Step = "company" | "platform" | "connect" | "prompts" | "analytics" | "launch";

export default function CompanyInfoPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [platform, setPlatform] = useState<Platform>(null);

  // Shopify fields
  const [shopDomain, setShopDomain] = useState("");
  const [storePassword, setStorePassword] = useState("");

  // WordPress fields
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpApiKey, setWpApiKey] = useState("");
  const [wpMode, setWpMode] = useState<"plugin" | "wpcom">("plugin");
  const [showGuide, setShowGuide] = useState(false);

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

        if (wpMode === "wpcom") {
          sessionStorage.setItem("signalor_onboarding", JSON.stringify({
            step: "prompts",
            companyName: companyName.trim(),
            orgId: org?.id,
            siteUrl: wpUrl,
            platform: "wordpress",
          }));
          const result = await connectWordPress(email, wpUrl, "", "");
          if (result.oauth_url) {
            window.location.href = result.oauth_url;
            return;
          }
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
      <div className="relative z-10 w-full max-w-lg">
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
              <CardDescription>Connect using the plugin or WordPress.com</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex rounded-lg bg-white/[0.04] p-1 mb-4">
                <button type="button" onClick={() => setWpMode("plugin")} className={`flex-1 rounded-md py-2 text-xs font-medium transition ${wpMode === "plugin" ? "bg-white/[0.1] text-foreground" : "text-muted-foreground"}`}>Plugin (API Key)</button>
                <button type="button" onClick={() => setWpMode("wpcom")} className={`flex-1 rounded-md py-2 text-xs font-medium transition ${wpMode === "wpcom" ? "bg-white/[0.1] text-foreground" : "text-muted-foreground"}`}>WordPress.com</button>
              </div>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wp-url">Site URL</Label>
                  <Input id="wp-url" placeholder={wpMode === "wpcom" ? "your-site.wordpress.com" : "your-site.com"} value={wpSiteUrl} onChange={(e) => setWpSiteUrl(e.target.value)} required autoFocus />
                </div>
                {wpMode === "plugin" && (
                  <>
                    <button type="button" onClick={() => setShowGuide(true)} className="w-full rounded-lg border border-dashed border-white/[0.15] bg-white/[0.03] px-4 py-3 text-left hover:bg-white/[0.06] transition">
                      <p className="text-xs font-semibold text-foreground">Need help installing the plugin?</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">View step-by-step setup guide</p>
                    </button>
                    <div className="space-y-2">
                      <Label htmlFor="wp-api-key">Plugin API Key</Label>
                      <Input id="wp-api-key" type="text" placeholder="Paste your API key here" value={wpApiKey} onChange={(e) => setWpApiKey(e.target.value)} required className="font-mono text-xs" />
                      <p className="text-[11px] text-muted-foreground">Find this in WP admin &rarr; <strong className="text-foreground">Settings &rarr; Signalor GEO</strong></p>
                    </div>
                  </>
                )}
                {wpMode === "wpcom" && <p className="text-xs text-muted-foreground">You&apos;ll be redirected to WordPress.com to authorize.</p>}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {statusMsg && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />{statusMsg}</div>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setStep("platform"); setError(""); }} disabled={loading}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                  <Button type="submit" className="gradient-btn flex-1" disabled={loading || !wpSiteUrl.trim() || (wpMode === "plugin" && !wpApiKey.trim())}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : "Connect"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: AI-Generated Prompts */}
        {step === "prompts" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="gradient-text text-2xl">Your AI Prompts</CardTitle>
              <CardDescription>
                These prompts will be used to track how AI engines mention your brand. Edit, add, or remove as needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPrompts ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Generating prompts for {companyName}...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {prompts.map((prompt, idx) => (
                      <div key={idx} className="flex items-start gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 group">
                        {editingIdx === idx ? (
                          <div className="flex-1 flex gap-2">
                            <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 text-xs h-8" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(idx)} />
                            <button onClick={() => handleSaveEdit(idx)} className="text-xs text-primary font-medium px-2">Save</button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-xs text-foreground leading-relaxed">{prompt}</span>
                            <button onClick={() => handleEditPrompt(idx)} className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-white/[0.1]">
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleRemovePrompt(idx)} className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-white/[0.1]">
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add new prompt */}
                  <div className="flex gap-2">
                    <Input value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} placeholder="Add a custom prompt..." className="flex-1 text-xs" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPrompt())} />
                    <button onClick={handleAddPrompt} disabled={!newPrompt.trim() || prompts.length >= 15} className="rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-foreground hover:bg-white/[0.12] transition disabled:opacity-40">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">{prompts.length}/15 prompts</p>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep("connect")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="gradient-btn flex-1" onClick={() => setStep("analytics")} disabled={loadingPrompts || prompts.length === 0}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Google Analytics */}
        {step === "analytics" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-[#F9AB00]/10 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-[#F9AB00]" />
              </div>
              <CardTitle className="gradient-text text-2xl">Google Analytics</CardTitle>
              <CardDescription>Connect Google Analytics to track how AI visibility affects your traffic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={async () => {
                  if (!session) return;
                  setLoading(true);
                  try {
                    const { auth_url } = await getGAAuthUrl(session.user.email);
                    window.location.href = auth_url;
                  } catch {
                    setError("Failed to connect Google Analytics.");
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center gap-4 rounded-xl border-2 border-transparent bg-white/[0.03] p-4 text-left transition-all hover:border-[#F9AB00]/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F9AB00]/10">
                  <BarChart3 className="h-6 w-6 text-[#F9AB00]" />
                </div>
                <div>
                  <p className="font-semibold">Connect Google Analytics</p>
                  <p className="text-sm text-muted-foreground">See traffic changes after GEO improvements</p>
                </div>
              </button>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep("prompts")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="gradient-btn flex-1" onClick={() => setStep("launch")}>
                  Skip for now <ArrowRight className="ml-2 h-4 w-4" />
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

              <Button className="gradient-btn w-full" onClick={handleLaunch} disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Rocket className="mr-2 h-4 w-4" /> Start GEO Analysis</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* WordPress Plugin Setup Guide Dialog */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-semibold text-foreground">WordPress Plugin Setup</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Follow these steps to connect your site</p>
              </div>
              <button onClick={() => setShowGuide(false)} className="rounded-lg p-1.5 hover:bg-accent transition">
                <span className="text-lg leading-none text-muted-foreground">&times;</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
                  <div className="flex-1 w-px bg-border mt-2" />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-foreground">Install the Signalor GEO Plugin</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Go to your WordPress admin. Click <strong className="text-foreground">Plugins &rarr; Add New Plugin</strong>.</p>
                  <div className="mt-3 rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Option A: Search in WordPress</p>
                    <p className="text-xs text-muted-foreground">Type <code className="bg-background px-1.5 py-0.5 rounded text-foreground font-mono">Signalor GEO</code> → Install → Activate.</p>
                  </div>
                  <div className="mt-2 rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Option B: Upload manually</p>
                    <a href="/downloads/signalor-geo.zip" download className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition">Download signalor-geo.zip</a>
                    <p className="text-xs text-muted-foreground">Then <strong className="text-foreground">Plugins &rarr; Add New &rarr; Upload Plugin</strong> → choose zip → Install → Activate.</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
                  <div className="flex-1 w-px bg-border mt-2" />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-foreground">Find Your API Key</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">In WP admin: <strong className="text-foreground">Settings &rarr; Signalor GEO</strong>. Click <strong className="text-foreground">Copy</strong> next to the API Key.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Paste the API Key</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Come back here, paste the key, enter your URL, and click Connect.</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 rounded-b-2xl">
              <button onClick={() => setShowGuide(false)} className="w-full rounded-xl py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
