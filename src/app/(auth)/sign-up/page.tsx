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
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
            Create account
          </span>
          <span className="text-xs text-slate-500">Step {stepIndex}</span>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
            Get Started Now
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Please create your account to continue.
          </CardDescription>
          <p className="pt-1 text-base font-medium text-slate-800">{title}</p>
          <CardDescription className="text-sm text-slate-500">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {errorParam === "no-account" && step === "auth-method" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center text-sm text-amber-800">
            No account found. Please sign up first.
          </p>
        )}
        {StepComponent && <StepComponent />}
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0 pt-5">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-indigo-700 hover:text-indigo-600 hover:underline">
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
