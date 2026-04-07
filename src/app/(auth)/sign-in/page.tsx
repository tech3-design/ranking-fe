"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/config";

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
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.replace(routes.dashboard);
      return;
    }
    reset();
    setAuthMode("sign-in");
  }, [reset, setAuthMode, isPending, session, router]);

  const { title, description } = STEP_CONTENT[step] ?? STEP_CONTENT["auth-method"];
  const StepComponent = STEP_COMPONENTS[step];
  const isOtpStep = step === "otp-verify";

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-3 px-0 pb-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium tracking-wide text-primary">
            Sign in
          </span>
          <span className="text-xs text-muted-foreground">
            Step {isOtpStep ? "2/2" : "1/2"}
          </span>
        </div>
        <div className="space-y-1">
          <CardTitle className="gradient-text text-2xl md:text-4xl font-semibold tracking-tight">
            Get Started Now
          </CardTitle>
          <CardDescription>
            Please log in to your account to continue.
          </CardDescription>
          <p className="pt-1 text-base font-medium text-foreground">{title}</p>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className=" p-5 ">
        {StepComponent && <StepComponent />}
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0 pt-5">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:text-primary/90 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
