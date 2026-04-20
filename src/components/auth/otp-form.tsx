"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { authClient } from "@/lib/auth-client";
import { checkOrganizationExists } from "@/lib/api/organizations";
import { routes } from "@/lib/config";

const OTP_LENGTH = 6;

export function OtpForm() {
  const router = useRouter();
  const { email, authMode, setStep } = useOnboardingStore();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;

    setLoading(true);
    setError("");

    try {
      await authClient.signIn.emailOtp({ email, otp });

      const hasOrg = await checkOrganizationExists(email).catch(() => false);

      if (authMode === "sign-up") {
        if (hasOrg) {
          // Already onboarded, go straight to dashboard
          router.push(routes.dashboard);
        } else {
          setStep("company-info");
        }
      } else {
        // Sign-in mode
        if (hasOrg) {
          router.push(routes.dashboard);
        } else {
          // No org found — user hasn't signed up yet
          setError(
            "No account found for this email. Please sign up first.",
          );
          await authClient.signOut();
        }
      }
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
    } catch {
      setError("Failed to resend code.");
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-foreground">
          Code sent to <span className="font-normal text-muted-foreground">{email}</span>
        </Label>
        <div className="flex justify-center">
          <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }, (_, i) => (
                <InputOTPSlot key={i} index={i} className="h-8 w-8 text-[13px]" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
      <Button
        type="submit"
        className="auth-cta-btn h-9 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
        disabled={loading || otp.length !== OTP_LENGTH}
      >
        {loading ? "Verifying…" : "Verify"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-8 w-full rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground"
        onClick={handleResend}
      >
        Resend code
      </Button>
    </form>
  );
}
