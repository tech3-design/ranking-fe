/** Only allow same-origin relative paths (open-redirect safe). */
export function safeInternalReturnPath(
  path: string | null | undefined,
): string | null {
  if (!path || typeof path !== "string") return null;
  const t = path.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://")) return null;
  return t;
}

export const POST_CHECKOUT_REDIRECT_KEY = "signalor_post_checkout_redirect";

/** Onboarding draft (step, company, prompts) — same key as company-info page. */
export const ONBOARDING_DRAFT_KEY = "signalor_onboarding_draft";

/**
 * After "Launch" sent the user to pricing, we store this so /payments/success
 * can call startAnalysis without another Launch click.
 */
export const PENDING_ANALYSIS_AFTER_PAYMENT_KEY =
  "signalor_pending_analysis_after_payment";

export type PendingAnalysisAfterPaymentV1 = {
  v: 1;
  url: string;
  run_type: "single_page" | "full_site";
  email: string;
  brand_name: string;
  org_id: number;
};

export function readPendingAnalysisAfterPayment(): PendingAnalysisAfterPaymentV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_ANALYSIS_AFTER_PAYMENT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (rec.v !== 1) return null;
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    const email = typeof rec.email === "string" ? rec.email.trim() : "";
    const brand_name =
      typeof rec.brand_name === "string" ? rec.brand_name.trim() : "";
    const org_id = typeof rec.org_id === "number" ? rec.org_id : NaN;
    const run_type =
      rec.run_type === "full_site" ? "full_site" : "single_page";
    if (!url || !email || !brand_name || !Number.isFinite(org_id)) return null;
    return { v: 1, url, run_type, email, brand_name, org_id };
  } catch {
    return null;
  }
}

export function clearPendingAnalysisAfterPayment(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_ANALYSIS_AFTER_PAYMENT_KEY);
  } catch {
    /* ignore */
  }
}

export function storePendingAnalysisAfterPayment(
  payload: Omit<PendingAnalysisAfterPaymentV1, "v">,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      PENDING_ANALYSIS_AFTER_PAYMENT_KEY,
      JSON.stringify({ v: 1, ...payload }),
    );
  } catch {
    /* ignore */
  }
}
