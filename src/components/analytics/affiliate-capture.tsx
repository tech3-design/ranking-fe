"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const AFFILIATE_KEY = "signalor.partner.code";
const AFFILIATE_EXPIRES_KEY = "signalor.partner.expiresAt";
const ATTRIBUTION_DAYS = 30;

/**
 * Stashes any `?aff=CODE` query param into localStorage on mount.
 *
 * 30-day last-click attribution: every new affiliate click overwrites the
 * existing code and resets the expiry. The sign-up flow reads this key after
 * account creation and POSTs to /api/partners/attribute/.
 */
export function AffiliateCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const aff = searchParams.get("aff");
    if (!aff) return;
    try {
      const expiresAt = Date.now() + ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(AFFILIATE_KEY, aff);
      localStorage.setItem(AFFILIATE_EXPIRES_KEY, String(expiresAt));
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  return null;
}

export { AFFILIATE_KEY, AFFILIATE_EXPIRES_KEY };
