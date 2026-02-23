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
      <Card className="w-full max-w-xl backdrop-blur-xl bg-card/50 border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">GEO Analyzer</CardTitle>
          <p className="text-muted-foreground text-sm">
            Analyze how well your website is optimized for AI search engines
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name (optional)</Label>
              <Input
                id="brand-name"
                type="text"
                placeholder="Auto-detected from URL if empty"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <MovingBorder>
              <Button type="submit" className="w-full relative" disabled={loading || !url.trim()}>
                {loading ? "Starting Analysis..." : "Analyze Now"}
              </Button>
            </MovingBorder>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
