"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackPartnerClick } from "@/lib/api/partners";
import {
  AFFILIATE_KEY,
  AFFILIATE_EXPIRES_KEY,
} from "@/components/analytics/affiliate-capture";

/**
 * Slim banner that shows above the pricing plans whenever the visitor arrived
 * via a creator's affiliate link (i.e. `signalor.partner.code` is set in
 * localStorage and not expired).
 *
 * The discount itself is applied server-side at checkout — this is purely a
 * "you have a discount waiting" reassurance.
 */
export function CreatorDiscountBanner() {
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const storedCode = localStorage.getItem(AFFILIATE_KEY);
      const expiresRaw = localStorage.getItem(AFFILIATE_EXPIRES_KEY);
      if (!storedCode) return;
      const expires = Number(expiresRaw || 0);
      if (expires && expires < Date.now()) return;
      setCode(storedCode);
      trackPartnerClick(storedCode)
        .then((res) => {
          if (cancelled) return;
          if (res.valid) setPartnerName(res.partner_name || "");
          else {
            // Code rejected by the server — drop the local state so we stop
            // showing the banner on subsequent visits.
            localStorage.removeItem(AFFILIATE_KEY);
            localStorage.removeItem(AFFILIATE_EXPIRES_KEY);
            setCode(null);
          }
        })
        .catch(() => {
          /* swallow — show the banner anyway */
        });
    } catch {
      /* ignore */
    }
    return () => {
      cancelled = true;
    };
  }, []);

  if (!code) return null;

  return (
    <div className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[12px] text-orange-800">
      <span className="min-w-0 truncate">
        <span className="font-semibold">10% creator discount applied</span>
        {partnerName ? <> via {partnerName}</> : null} — automatically taken off at checkout.
      </span>
      <Link
        href={`/creators-program/${code}`}
        className="shrink-0 font-semibold underline-offset-2 hover:underline"
      >
        Learn more
      </Link>
    </div>
  );
}
