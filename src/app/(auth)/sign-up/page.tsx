"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/config";

const STEP_CONTENT: Record<string, { title: string; description: string }> = {
  "auth-method": {
    title: "Create your account",
    description: "Use your work email or continue with Google.",
  },
  "otp-verify": {
    title: "",
    description: "",
  },
  "company-info": {
    title: "Company",
    description: "Name and site help us tailor the product.",
  },
};

const STEP_HERO: Record<
  OnboardingStep,
  { headline: string; sub: string; badge: string }
> = {
  "auth-method": {
    headline: "Sign up",
    sub: "Create your account to continue.",
    badge: "Create account",
  },
  "otp-verify": {
    headline: "Verify email",
    sub: "We sent a 6-digit code to your inbox.",
    badge: "Verify",
  },
  "company-info": {
    headline: "Company details",
    sub: "Almost done — add your organization.",
    badge: "Profile",
  },
  complete: {
    headline: "Welcome",
    sub: "Redirecting…",
    badge: "Done",
  },
};

const STEP_COMPONENTS: Partial<Record<OnboardingStep, React.ComponentType>> = {
  "auth-method": AuthMethodForm,
  "otp-verify": OtpForm,
  "company-info": CompanyInfoForm,
};

function SignUpContent() {
  const { step, setAuthMode, reset } = useOnboardingStore();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (!isPending && session) {
      router.replace(routes.dashboard);
      return;
    }
    reset();
    setAuthMode("sign-up");
  }, [reset, setAuthMode, isPending, session, router]);

  const { title, description } =
    STEP_CONTENT[step] ?? STEP_CONTENT["auth-method"];
  const hero = STEP_HERO[step] ?? STEP_HERO["auth-method"];
  const StepComponent = STEP_COMPONENTS[step];
  const stepIndex =
    step === "auth-method" ? "1/3" : step === "otp-verify" ? "2/3" : "3/3";
  const showStepDetail = step !== "auth-method";

  return (
    <div>
      <CardHeader className="space-y-3 px-0 pb-0 pt-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            <div className="flex items-center justify-between gap-2">
              <div>{hero.headline}</div>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                Step {stepIndex}
              </span>
            </div>
            <div></div>
          </CardTitle>
          <CardDescription className="text-[13px] leading-relaxed">
            {hero.sub}
          </CardDescription>
          {showStepDetail && (
            <div className="pt-2">
              <p className="text-[13px] font-medium text-foreground">{title}</p>
              <CardDescription className="mt-0.5 text-[12px]">
                {description}
              </CardDescription>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pt-4">
        {errorParam === "no-account" && step === "auth-method" && (
          <p className="rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-2 text-center text-[12px] text-amber-950">
            No account found. Please sign up first.
          </p>
        )}
        {StepComponent && <StepComponent />}
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0 pt-5">
        <p className="text-center text-[12px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline decoration-neutral-300 underline-offset-2 hover:decoration-foreground"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}
