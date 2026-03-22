"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthMethodForm } from "@/components/auth/auth-method-form";
import { OtpForm } from "@/components/auth/otp-form";
import { CompanyInfoForm } from "@/components/auth/company-info-form";
import {
  useOnboardingStore,
  type OnboardingStep,
} from "@/lib/stores/onboarding-store";

const STEP_CONTENT: Record<string, { title: string; description: string }> = {
  "auth-method": {
    title: "Create your account",
    description: "Get started with your email or Google account",
  },
  "otp-verify": {
    title: "Verify your email",
    description: "We sent a verification code to your email",
  },
  "company-info": {
    title: "Tell us about your company",
    description: "This helps us personalize your experience",
  },
};

const STEP_COMPONENTS: Partial<Record<OnboardingStep, React.ComponentType>> = {
  "auth-method": AuthMethodForm,
  "otp-verify": OtpForm,
  "company-info": CompanyInfoForm,
};

function SignUpContent() {
  const { step, setAuthMode, reset } = useOnboardingStore();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    reset();
    setAuthMode("sign-up");
  }, [reset, setAuthMode]);

  const { title, description } =
    STEP_CONTENT[step] ?? STEP_CONTENT["auth-method"];
  const StepComponent = STEP_COMPONENTS[step];
  const stepIndex = step === "auth-method" ? "1/3" : step === "otp-verify" ? "2/3" : "3/3";

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-3 px-0 pb-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium tracking-wide text-blue-300">
            Create account
          </span>
          <span className="text-xs text-slate-400">Step {stepIndex}</span>
        </div>
        <div className="space-y-1">
          <CardTitle className="gradient-text text-4xl font-semibold tracking-tight">
            Get Started Now
          </CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Please create your account to continue.
          </CardDescription>
          <p className="pt-1 text-base font-medium text-slate-200">{title}</p>
          <CardDescription className="text-sm text-slate-400">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-5 shadow-sm">
        {errorParam === "no-account" && step === "auth-method" && (
          <p className="rounded-lg border border-amber-200/20 bg-amber-500/10 p-2 text-center text-sm text-amber-300">
            No account found. Please sign up first.
          </p>
        )}
        {StepComponent && <StepComponent />}
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0 pt-5">
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-emerald-400 hover:text-blue-300 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}
