"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getSubscriptionStatus } from "@/lib/api/payments";
import { routes } from "@/lib/config";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session) return;

    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const status = await getSubscriptionStatus(session.user.email);
        if (status.is_active) {
          clearInterval(poll);
          setChecking(false);
          setTimeout(() => router.replace(routes.dashboard), 1500);
        }
      } catch {}
      if (attempts > 20) {
        clearInterval(poll);
        setChecking(false);
        router.replace(routes.dashboard);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#171717] px-4 text-center">
      {checking ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-[#3ecf8e]" />
          <p className="mt-4 text-sm text-neutral-400">Confirming your payment...</p>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-12 w-12 text-[#3ecf8e]" />
          <h1 className="mt-4 text-xl md:text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="mt-2 text-sm text-neutral-400">Redirecting to your dashboard...</p>
        </>
      )}
    </div>
  );
}
