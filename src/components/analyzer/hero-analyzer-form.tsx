"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
];

export function HeroAnalyzerForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    const normalizedUrl = url.startsWith("http://") || url.startsWith("https://")
      ? url.trim()
      : `https://${url.trim()}`;

    setError("");
    setLoading(true);
    try {
      const run = await startAnalysis({
        url: normalizedUrl,
        run_type: "full_site",
        country,
      });
      router.push(routes.analyzerResults(run.id));
    } catch {
      setError("Failed to start analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 w-full max-w-3xl">
      <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_auto]">
        <Input
          type="text"
          placeholder="Enter website URL (example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-11 border-border bg-input text-foreground placeholder:text-slate-500"
          required
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-11 border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        >
          {COUNTRY_OPTIONS.map((option) => (
            <option key={option} value={option} className="text-foreground">
              {option}
            </option>
          ))}
        </select>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !url.trim()}
          className="h-11 px-6"
        >
          {loading ? "Starting..." : "Check AI Visibility"}
        </Button>
      </div>
      {error && (
        <p className="mt-2 rounded-md border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}
    </form>
  );
}
