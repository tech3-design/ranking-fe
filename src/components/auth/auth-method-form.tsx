"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { authClient } from "@/lib/auth-client";
import { checkOrganizationExists } from "@/lib/api/organizations";
import { OAuthButton } from "./oauth-button";

export function AuthMethodForm() {
  const { authMode, setEmail, setStep } = useOnboardingStore();
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const orgExists = await checkOrganizationExists(email);

      if (authMode === "sign-up" && orgExists) {
        setError("An account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      }

      if (authMode === "sign-in" && !orgExists) {
        setError("No account found for this email. Please sign up first.");
        setLoading(false);
        return;
      }

      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setEmail(email);
      setStep("otp-verify");
    } catch {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Checking\u2026" : "Continue with Email"}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>

      <div className="space-y-3">
        <OAuthButton provider="google" />
        <OAuthButton provider="apple" />
      </div>
    </div>
  );
}
