import { apiClient } from "./client";

export interface SubscriptionStatus {
  is_active: boolean;
  status: string;
  current_period_end: string | null;
  currency: string;
}

const BYPASS_STATUS: SubscriptionStatus = {
  is_active: true,
  status: "dev_bypass",
  current_period_end: null,
  currency: "usd",
};

function isPaymentGateBypassed(): boolean {
  if (
    process.env.NEXT_PUBLIC_FORCE_PAYMENT_GATE === "true" ||
    process.env.NEXT_PUBLIC_FORCE_PAYMENT_GATE === "1"
  ) {
    return false;
  }
  if (
    process.env.NEXT_PUBLIC_SKIP_PAYMENT_GATE === "true" ||
    process.env.NEXT_PUBLIC_SKIP_PAYMENT_GATE === "1"
  ) {
    return true;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return true;
    }
  }
  return false;
}

export async function createCheckoutSession(
  email: string,
): Promise<{ checkout_url: string }> {
  const { data } = await apiClient.post<{ checkout_url: string }>(
    "/api/payments/create-checkout/",
    { email },
  );
  return data;
}

export async function getSubscriptionStatus(
  email: string,
): Promise<SubscriptionStatus> {
  if (isPaymentGateBypassed()) {
    return BYPASS_STATUS;
  }
  const { data } = await apiClient.get<SubscriptionStatus>(
    "/api/payments/status/",
    { params: { email } },
  );
  return data;
}

export async function terminateAccount(
  email: string,
): Promise<{ message: string; deactivated_at?: string }> {
  const { data } = await apiClient.post("/api/account/terminate/", { email });
  return data;
}

export async function cancelTermination(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/account/cancel-termination/", { email });
  return data;
}

export async function deleteAccount(
  email: string,
  confirm: string,
): Promise<{ message: string; deleted: Record<string, number> }> {
  const { data } = await apiClient.post("/api/account/delete/", { email, confirm });
  return data;
}
