"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MovingBorder } from "@/components/ui/moving-border";
import { startAnalysis } from "@/lib/api/analyzer";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { routes } from "@/lib/config";

export function UrlInputForm({ email }: { email?: string }) {
  const [url, setUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setRunId, startPolling, reset } = useAnalyzerStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let normalizedUrl = url.trim();
      if (
        !normalizedUrl.startsWith("http://") &&
        !normalizedUrl.startsWith("https://")
      ) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const result = await startAnalysis({
        url: normalizedUrl,
        run_type: "single_page",
        email,
        brand_name: brandName.trim() || undefined,
      });

      reset();
      setRunId(result.id);
      startPolling();
      router.push(routes.analyzerResults(result.id));
    } catch {
      setError("Failed to start analysis. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="glass-card w-full max-w-2xl border-border/70 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text md:text-3xl">
            Analyze Your Website
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter a page URL to evaluate AI visibility, technical readiness, and
            brand strength.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="example.com/pricing"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  type="text"
                  placeholder="Optional"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
              Tip: For best results, use a specific page URL (product page,
              category, blog article) instead of only the homepage.
            </div>

            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <p className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
                Technical health checks
              </p>
              <p className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
                Content and E-E-A-T scoring
              </p>
              <p className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
                AI visibility recommendations
              </p>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <MovingBorder>
              <Button
                type="submit"
                size="lg"
                className="relative w-full"
                disabled={loading || !url.trim()}
              >
                {loading ? "Starting Analysis..." : "Analyze Now"}
              </Button>
            </MovingBorder>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
