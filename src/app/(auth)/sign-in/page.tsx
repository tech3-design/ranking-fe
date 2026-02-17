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

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{StepComponent && <StepComponent />}</CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
