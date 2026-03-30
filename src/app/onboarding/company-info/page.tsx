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
} from "@/lib/api/integrations";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import axios from "axios";
import { Loader2, ShoppingBag, Globe, ArrowLeft, ArrowRight } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

type Platform = "shopify" | "wordpress" | null;
type Step = "company" | "platform" | "connect";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(routes.signIn);
    }
  }, [isPending, session, router]);

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
      // Step 1: Create org
      let org;
      let siteUrl =
        platform === "shopify"
          ? `https://${shopDomain.replace(/^https?:\/\//, "")}`
          : wpSiteUrl.trim();
      if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
        siteUrl = `https://${siteUrl}`;
      }

      try {
        org = await createOrganization({
          name: companyName.trim(),
          url: siteUrl,
          email,
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          // Org already exists, continue
          org = err.response.data;
        } else {
          throw err;
        }
      }

      const orgId = org?.id;

      // Step 2: Connect integration
      setStatusMsg(
        platform === "shopify"
          ? "Connecting to Shopify..."
          : "Connecting to WordPress..."
      );

      if (platform === "shopify") {
        const domain = shopDomain
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
        const { auth_url } = await getShopifyAuthUrl(
          email,
          domain,
          "/dashboard",
          orgId,
          storePassword || undefined,
        );
        // Redirect to Shopify OAuth — after callback, user lands on /dashboard
        window.location.href = auth_url;
        return;
      }

      if (platform === "wordpress") {
        let siteUrl = wpSiteUrl.trim();
        if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
          siteUrl = `https://${siteUrl}`;
        }

        if (wpMode === "wpcom") {
          // WordPress.com OAuth flow
          const result = await connectWordPress(email, siteUrl, "", "");
          if (result.oauth_url) {
            window.location.href = result.oauth_url;
            return;
          }
        }

        // Self-hosted with plugin — pass API key
        setStatusMsg("Connecting to your WordPress site...");
        const result = await connectWordPress(email, siteUrl, wpApiKey.trim(), "");

        // Start analysis
        setStatusMsg("Starting analysis on your site...");
        const wpAnalysis = await startAnalysis({
          url: siteUrl,
          run_type: "single_page",
          email,
          brand_name: companyName.trim(),
          org_id: orgId,
        });
        router.push(routes.dashboardProject(wpAnalysis.slug));
        return;
      }

      // Fallback
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Connection failed. Please check your details and try again.";
        setError(msg);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStatusMsg("");
    } finally {
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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <BackgroundBeams />
      <div className="relative z-10 w-full max-w-lg">
        {/* Step 1: Company name */}
        {step === "company" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">
                What&apos;s your company name?
              </CardTitle>
              <CardDescription>
                We&apos;ll use this to set up your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="gradient-btn w-full">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Platform selection */}
        {step === "platform" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">
                Connect your store
              </CardTitle>
              <CardDescription>
                Choose your platform to get started with AI visibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => handlePlatformSelect("shopify")}
                className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white/[0.03] p-4 text-left transition-all hover:border-emerald-500/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#96bf48]/10 shadow-[0_0_15px_rgba(150,191,72,0.15)]">
                  <ShoppingBag className="h-6 w-6 text-[#96bf48]" />
                </div>
                <div>
                  <p className="font-semibold">Shopify</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your Shopify store via OAuth
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformSelect("wordpress")}
                className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white/[0.03] p-4 text-left transition-all hover:border-emerald-500/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#21759b]/10 shadow-[0_0_15px_rgba(33,117,155,0.15)]">
                  <Globe className="h-6 w-6 text-[#21759b]" />
                </div>
                <div>
                  <p className="font-semibold">WordPress</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your WordPress site
                  </p>
                </div>
              </button>

              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setStep("company")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Connect details */}
        {step === "connect" && platform === "shopify" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">
                Connect Shopify
              </CardTitle>
              <CardDescription>
                Enter your Shopify store domain to connect via OAuth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-domain">Store domain</Label>
                  <Input
                    id="shop-domain"
                    placeholder="your-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g. your-store.myshopify.com
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-password">Storefront password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="store-password"
                    type="password"
                    placeholder="Leave empty if store is not password-protected"
                    value={storePassword}
                    onChange={(e) => setStorePassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dev stores have password protection. Find it in Shopify Admin &rarr; Online Store &rarr; Preferences.
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {statusMsg && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {statusMsg}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("platform");
                      setError("");
                      setStatusMsg("");
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-btn flex-1"
                    disabled={loading || !shopDomain.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect & Analyze"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "connect" && platform === "wordpress" && (
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="gradient-text text-2xl">
                Connect WordPress
              </CardTitle>
              <CardDescription>
                Connect using the Signalor plugin or WordPress.com OAuth
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tab toggle */}
              <div className="flex rounded-lg bg-white/[0.04] p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setWpMode("plugin")}
                  className={`flex-1 rounded-md py-2 text-xs font-medium transition ${wpMode === "plugin" ? "bg-white/[0.1] text-foreground" : "text-muted-foreground"}`}
                >
                  Plugin (API Key)
                </button>
                <button
                  type="button"
                  onClick={() => setWpMode("wpcom")}
                  className={`flex-1 rounded-md py-2 text-xs font-medium transition ${wpMode === "wpcom" ? "bg-white/[0.1] text-foreground" : "text-muted-foreground"}`}
                >
                  WordPress.com
                </button>
              </div>

              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wp-url">Site URL</Label>
                  <Input
                    id="wp-url"
                    type="text"
                    placeholder={wpMode === "wpcom" ? "your-site.wordpress.com" : "your-site.com"}
                    value={wpSiteUrl}
                    onChange={(e) => setWpSiteUrl(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {wpMode === "plugin" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowGuide(true)}
                      className="w-full rounded-lg border border-dashed border-white/[0.15] bg-white/[0.03] px-4 py-3 text-left hover:bg-white/[0.06] transition"
                    >
                      <p className="text-xs font-semibold text-foreground">Need help installing the plugin?</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">View step-by-step setup guide</p>
                    </button>

                    <div className="space-y-2">
                      <Label htmlFor="wp-api-key">Plugin API Key</Label>
                      <Input
                        id="wp-api-key"
                        type="text"
                        placeholder="Paste your API key here"
                        value={wpApiKey}
                        onChange={(e) => setWpApiKey(e.target.value)}
                        required
                        className="font-mono text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Find this in your WordPress admin &rarr; <strong className="text-foreground">Settings &rarr; Signalor GEO</strong>
                      </p>
                    </div>
                  </>
                )}

                {wpMode === "wpcom" && (
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll be redirected to WordPress.com to authorize access.
                  </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                {statusMsg && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {statusMsg}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("platform");
                      setError("");
                      setStatusMsg("");
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-btn flex-1"
                    disabled={loading || !wpSiteUrl.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect & Analyze"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* WordPress Plugin Setup Guide Dialog */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-semibold text-foreground">WordPress Plugin Setup</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Follow these steps to connect your site</p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1.5 hover:bg-accent transition"
              >
                <span className="text-lg leading-none text-muted-foreground">&times;</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
                  <div className="flex-1 w-px bg-border mt-2" />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-foreground">Install the Signalor GEO Plugin</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Go to your WordPress admin dashboard. In the left sidebar, click <strong className="text-foreground">Plugins</strong> then <strong className="text-foreground">Add New Plugin</strong>.
                  </p>
                  <div className="mt-3 rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Option A: Search in WordPress</p>
                    <p className="text-xs text-muted-foreground">
                      In the search box, type <code className="bg-background px-1.5 py-0.5 rounded text-foreground font-mono">Signalor GEO</code> and press Enter. Click <strong className="text-foreground">Install Now</strong> then <strong className="text-foreground">Activate</strong>.
                    </p>
                  </div>
                  <div className="mt-2 rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Option B: Upload manually</p>
                    <p className="text-xs text-muted-foreground">
                      If the plugin isn&apos;t in the directory yet, download the zip and upload it:
                    </p>
                    <a
                      href="/downloads/signalor-geo.zip"
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition"
                    >
                      Download signalor-geo.zip
                    </a>
                    <p className="text-xs text-muted-foreground">
                      Then go to <strong className="text-foreground">Plugins &rarr; Add New &rarr; Upload Plugin</strong> &rarr; choose the zip file &rarr; <strong className="text-foreground">Install Now</strong> &rarr; <strong className="text-foreground">Activate</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
                  <div className="flex-1 w-px bg-border mt-2" />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-foreground">Find Your API Key</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    After activating the plugin, go to your WordPress admin sidebar: <strong className="text-foreground">Settings &rarr; Signalor GEO</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    You&apos;ll see a settings page with your <strong className="text-foreground">Site URL</strong> and <strong className="text-foreground">API Key</strong>. Click the <strong className="text-foreground">Copy</strong> button next to the API Key.
                  </p>
                  <div className="mt-3 rounded-lg bg-muted/50 border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      The API Key looks like: <code className="bg-background px-1.5 py-0.5 rounded text-foreground font-mono text-[10px]">aB3dEfGh1234ijKLmnOPqrST...</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Paste the API Key Here</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Come back to this page and paste the API Key into the <strong className="text-foreground">Plugin API Key</strong> field. Enter your site URL and click <strong className="text-foreground">Connect &amp; Analyze</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    That&apos;s it! Signalor will connect to your site, run a GEO analysis, and show you recommendations to improve your AI visibility.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
