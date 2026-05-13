"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useConsentStore, hasDecidedConsent } from "@/lib/stores/consent-store";
import { Cookie } from "@/components/icons";

/**
 * Bottom-of-screen cookie consent banner. Renders on first visit only
 * (no stored decision). Two choices: Accept all / Reject all.
 *
 * Mount once in the root layout. Tracker components (Amplitude, Clarity,
 * GA) check `useConsentStore(s => s.analytics)` before initializing ,
 * they stay dormant until the user accepts.
 */
export function CookieConsentBanner() {
  const hydrated = useConsentStore((s) => s.hydrated);
  const necessary = useConsentStore((s) => s.necessary);
  const analytics = useConsentStore((s) => s.analytics);
  const marketing = useConsentStore((s) => s.marketing);
  const decidedAt = useConsentStore((s) => s.decidedAt);
  const hydrate = useConsentStore((s) => s.hydrate);
  const acceptAll = useConsentStore((s) => s.acceptAll);
  const rejectAll = useConsentStore((s) => s.rejectAll);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Render nothing until we've read localStorage so we don't flash the
  // banner for users who've already decided.
  if (!hydrated) return null;
  if (hasDecidedConsent({ necessary, analytics, marketing, decidedAt })) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-6 sm:py-3 lg:px-10">
        <div className="hidden shrink-0 sm:block">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Cookie className="h-4 w-4" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">We use cookies</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            We use cookies to keep the app working and, if you agree, to understand how it is used
            so we can improve it.{" "}
            <Link
              href="/policy"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={rejectAll}
            className="inline-flex flex-1 items-center justify-center rounded-sm border border-black/10 bg-white px-4 py-2 text-[12px] font-semibold text-foreground hover:bg-neutral-50 sm:flex-none"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex flex-1 items-center justify-center rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:brightness-110 sm:flex-none"
          >
            Agree
          </button>
        </div>
      </div>
    </div>
  );
}
