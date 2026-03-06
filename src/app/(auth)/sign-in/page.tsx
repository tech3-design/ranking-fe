"use client";

import { useEffect } from "react";
import Link from "next/link";
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
import { useOnboardingStore, type OnboardingStep } from "@/lib/stores/onboarding-store";

const STEP_CONTENT: Record<string, { title: string; description: string }> = {
  "auth-method": {
    title: "Welcome back",
    description: "Sign in with your email or Google account",
  },
  "otp-verify": {
    title: "Verify your email",
    description: "We sent a verification code to your email",
  },
};

const STEP_COMPONENTS: Partial<Record<OnboardingStep, React.ComponentType>> = {
  "auth-method": AuthMethodForm,
  "otp-verify": OtpForm,
};

export default function SignInPage() {
  const { step, setAuthMode, reset } = useOnboardingStore();

  useEffect(() => {
    reset();
    setAuthMode("sign-in");
  }, [reset, setAuthMode]);

  const { title, description } = STEP_CONTENT[step] ?? STEP_CONTENT["auth-method"];
  const StepComponent = STEP_COMPONENTS[step];
  const isOtpStep = step === "otp-verify";

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-3 px-0 pb-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
            Sign in
          </span>
          <span className="text-xs text-slate-500">
            Step {isOtpStep ? "2/2" : "1/2"}
          </span>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-4xl font-semibold tracking-tight text-slate-900">
            Get Started Now
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Please log in to your account to continue.
          </CardDescription>
          <p className="pt-1 text-base font-medium text-slate-800">{title}</p>
          <CardDescription className="text-sm text-slate-500">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {StepComponent && <StepComponent />}
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0 pt-5">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-indigo-700 hover:text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
