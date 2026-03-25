"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { checkOrganizationExists } from "@/lib/api/organizations";
import { routes } from "@/lib/config";

const CALLBACK_TIMEOUT_MS = 10_000;

function CallbackResolver() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout: if session never arrives, redirect to sign-in
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), CALLBACK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timedOut && !session) {
      router.replace(routes.signIn);
    }
  }, [timedOut, session, router]);

  useEffect(() => {
    if (isPending || !session) return;

    const mode = searchParams.get("mode") || "sign-in";

    async function resolve() {
      const hasOrg = await checkOrganizationExists(
        session!.user.email,
      ).catch(() => false);

      if (mode === "sign-up") {
        router.replace(
          hasOrg ? routes.dashboard : routes.onboardingCompanyInfo,
        );
      } else {
        if (hasOrg) {
          router.replace(routes.dashboard);
        } else {
          await signOut();
          router.replace(`${routes.signUp}?error=no-account`);
        }
      }
    }

    resolve();
  }, [session, isPending, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <p className="text-muted-foreground">Setting up your account...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CallbackResolver />
    </Suspense>
  );
}
