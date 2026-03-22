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

  // WordPress fields
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");

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
      const siteUrl =
        platform === "shopify"
          ? `https://${shopDomain.replace(/^https?:\/\//, "")}`
          : wpSiteUrl.trim();

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
          "/pricing",
          orgId
        );
        // Redirect to Shopify OAuth — after callback, user lands on /pricing
        window.location.href = auth_url;
        return;
      }

      if (platform === "wordpress") {
        const result = await connectWordPress(
          email,
          wpSiteUrl.trim(),
          wpUsername.trim(),
          wpAppPassword.trim()
        );

        // If WordPress.com, redirect to OAuth
        if (result.oauth_url) {
          window.location.href = result.oauth_url;
          return;
        }
      }

      // Step 3: Redirect to pricing for payment
      router.push("/pricing");
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#171717] px-4">
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
                Enter your WordPress site details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wp-url">Site URL</Label>
                  <Input
                    id="wp-url"
                    type="url"
                    placeholder="https://your-site.com"
                    value={wpSiteUrl}
                    onChange={(e) => setWpSiteUrl(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-username">Username</Label>
                  <Input
                    id="wp-username"
                    placeholder="admin"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-password">Application Password</Label>
                  <Input
                    id="wp-password"
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Generate one in WordPress under Users &rarr; Profile &rarr; Application Passwords.
                    For WordPress.com sites, just enter the site URL.
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
                    disabled={loading || !wpSiteUrl.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {statusMsg || "Connecting..."}
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
    </div>
  );
}
