"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useSession } from "@/lib/auth-client";
import { createOrganization } from "@/lib/api/organizations";
import { routes } from "@/lib/config";
import axios from "axios";

export function CompanyInfoForm() {
  const router = useRouter();
  const { email: storeEmail, setCompanyInfo, setStep } = useOnboardingStore();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefer session email (survives refresh), fall back to store email
  const email = session?.user?.email || storeEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email) return;

    setLoading(true);
    setError("");

    try {
      await createOrganization({
        name: name.trim(),
        url: url.trim(),
        email,
      });
      setCompanyInfo(name.trim(), url.trim());
      setStep("complete");
      router.push(routes.dashboard);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        router.push(routes.dashboard);
        return;
      }
      setError("Failed to save company info. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <div className="text-center space-y-2">
        <p className="text-sm text-destructive">
          Session expired. Please sign up again.
        </p>
        <Button variant="outline" onClick={() => router.push(routes.signUp)}>
          Back to sign up
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company name</Label>
        <Input
          id="company-name"
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-url">Company website (optional)</Label>
        <Input
          id="company-url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving\u2026" : "Complete setup"}
      </Button>
    </form>
  );
}
