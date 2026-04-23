"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const isSignUp = authMode === "sign-up";

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px] font-medium text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            autoComplete="email"
            className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
          />
          {isSignUp && (
            <p className="text-[11px] text-neutral-600">Use your work email.</p>
          )}
        </div>
        {error && (
          <p className="text-[12px] font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="auth-cta-btn h-9 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
          disabled={loading}
        >
          {loading ? "Sending…" : isSignUp ? "Sign Up" : "Sign In"}
        </Button>
      </form>

      <div className="relative py-0.5">
        {/* <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden /> */}
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-[11px] text-muted-foreground lg:bg-transparent">
            or continue with
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <OAuthButton provider="google" />
      </div>
    </div>
  );
}
