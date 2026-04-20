"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
    title: "Sign in",
    description: "Work email or Google.",
  },
  "otp-verify": {
    title: "",
    description: "",
  },
};

const STEP_HERO: Record<
  Exclude<OnboardingStep, "company-info" | "complete">,
  { headline: string; sub: string; badge: string }
> = {
  "auth-method": {
    headline: "Sign in",
    sub: "Welcome back, use your email or Google.",
    badge: "Sign in",
  },
  "otp-verify": {
    headline: "Verify email",
    sub: "Enter the code to finish signing in.",
    badge: "Verify",
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
  const hero =
    step === "otp-verify" ? STEP_HERO["otp-verify"] : STEP_HERO["auth-method"];
  const StepComponent = STEP_COMPONENTS[step];
  const isOtpStep = step === "otp-verify";
  const showStepDetail = isOtpStep;

  return (
    <div>
      <CardHeader className="space-y-3 px-0 pb-0 pt-0">
        {/* <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-[#fff4f2] px-2 py-0.5 text-[11px] font-medium text-[#b9382d]">
            {hero.badge}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            Step {isOtpStep ? "2/2" : "1/2"}
          </span>
        </div> */}
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          <div className="flex items-center justify-between gap-2">
          {/* <span className="rounded-md bg-[#fff4f2] px-2 py-0.5 text-[11px] font-medium text-[#b9382d]">
            {hero.badge}
          </span> */}
          <div>
          {hero.headline}
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            Step {isOtpStep ? "2/2" : "1/2"}
          </span>
        </div>
            {/* {hero.headline} */}
          </CardTitle>
          <CardDescription className="text-[13px] leading-relaxed">
            {hero.sub}
          </CardDescription>
          {showStepDetail && (
            <div className="pt-2">
              <p className="text-[13px] font-medium text-foreground">{title}</p>
              <CardDescription className="mt-0.5 text-[12px]">{description}</CardDescription>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pt-4">
        {StepComponent && <StepComponent />}
      </CardContent>
      <CardFooter className="justify-center px-0 pb-0 pt-5">
        <p className="text-center text-[12px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline decoration-neutral-300 underline-offset-2 hover:decoration-foreground"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </div>
  );
}
