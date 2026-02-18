"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startAnalysis } from "@/lib/api/analyzer";
import { useAnalyzerStore } from "@/lib/stores/analyzer-store";
import { routes } from "@/lib/config";

export function UrlInputForm({ email }: { email?: string }) {
  const [url, setUrl] = useState("");
  const [runType, setRunType] = useState<"single_page" | "full_site">(
    "single_page",
  );
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
        run_type: runType,
        email,
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
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">GEO Analyzer</CardTitle>
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
            <Label>Analysis Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={runType === "single_page" ? "default" : "outline"}
                size="sm"
                onClick={() => setRunType("single_page")}
              >
                Single Page
              </Button>
              <Button
                type="button"
                variant={runType === "full_site" ? "default" : "outline"}
                size="sm"
                onClick={() => setRunType("full_site")}
              >
                Full Site (up to 20 pages)
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !url.trim()}>
            {loading ? "Starting Analysis..." : "Analyze Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
