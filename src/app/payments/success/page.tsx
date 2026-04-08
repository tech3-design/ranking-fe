"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { startAnalysis } from "@/lib/api/analyzer";
import { getSubscriptionStatus } from "@/lib/api/payments";
import {
  ONBOARDING_DRAFT_KEY,
  POST_CHECKOUT_REDIRECT_KEY,
  clearPendingAnalysisAfterPayment,
  readPendingAnalysisAfterPayment,
  safeInternalReturnPath,
} from "@/lib/internal-nav";
import { routes } from "@/lib/config";
import { CheckCircle2, Loader2 } from "lucide-react";

/** Read and remove post-checkout redirect (same as before, exported for reuse). */
function consumePostCheckoutPath(): string {
  try {
    const raw = sessionStorage.getItem(POST_CHECKOUT_REDIRECT_KEY);
    const safe = safeInternalReturnPath(raw);
    sessionStorage.removeItem(POST_CHECKOUT_REDIRECT_KEY);
    return safe || routes.dashboard;
  } catch {
    return routes.dashboard;
  }
}

export default function PaymentSuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your payment...");
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let attempts = 0;

    let busy = false;
    const poll = setInterval(async () => {
      if (cancelled || busy) return;
      busy = true;
      attempts += 1;

      try {
        const status = await getSubscriptionStatus(session.user.email);
        if (!status.is_active) {
          if (attempts > 20) {
            clearInterval(poll);
            if (!cancelled) {
              setShowSuccessIcon(false);
              setMessage(
                "Could not confirm payment yet. You can continue from the app.",
              );
              router.replace(consumePostCheckoutPath());
            }
          }
          return;
        }

        clearInterval(poll);

        const pending = readPendingAnalysisAfterPayment();
        const emailMatch =
          pending &&
          pending.email.toLowerCase() === session.user.email.toLowerCase();

        if (pending && !emailMatch) {
          clearPendingAnalysisAfterPayment();
        }

        if (emailMatch && pending) {
          setMessage("Starting your GEO analysis...");
          setShowSuccessIcon(false);
          try {
            const run = await startAnalysis({
              url: pending.url,
              run_type: pending.run_type,
              email: pending.email,
              brand_name: pending.brand_name,
              org_id: pending.org_id,
            });
            if (cancelled) return;
            clearPendingAnalysisAfterPayment();
            try {
              sessionStorage.removeItem(POST_CHECKOUT_REDIRECT_KEY);
              sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
            } catch {
              /* ignore */
            }
            router.replace(routes.dashboardProject(run.slug));
          } catch {
            if (cancelled) return;
            setMessage("Payment received. Continue setup to run analysis.");
            router.replace(consumePostCheckoutPath());
          }
          return;
        }

        setShowSuccessIcon(true);
        setMessage("Redirecting...");
        const next = consumePostCheckoutPath();
        setTimeout(() => {
          if (!cancelled) router.replace(next);
        }, 1500);
      } catch {
        if (attempts > 20) {
          clearInterval(poll);
          if (!cancelled) {
            setShowSuccessIcon(false);
            router.replace(consumePostCheckoutPath());
          }
        }
      } finally {
        busy = false;
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {!showSuccessIcon ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-neutral-400">{message}</p>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <h1 className="mt-4 text-xl md:text-2xl font-bold text-white">
            Payment Successful!
          </h1>
          <p className="mt-2 text-sm text-neutral-400">{message}</p>
        </>
      )}
    </div>
  );
}
