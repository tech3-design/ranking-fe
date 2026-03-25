import { apiClient } from "./client";

export interface SubscriptionStatus {
  is_active: boolean;
  status: string;
  current_period_end: string | null;
  currency: string;
}

export async function createCheckoutSession(
  email: string,
  currency: string = "usd",
): Promise<{ checkout_url: string }> {
  const { data } = await apiClient.post<{ checkout_url: string }>(
    "/api/payments/create-checkout/",
    { email, currency },
  );
  return data;
}

export async function getSubscriptionStatus(
  email: string,
): Promise<SubscriptionStatus> {
  const { data } = await apiClient.get<SubscriptionStatus>(
    "/api/payments/status/",
    { params: { email } },
  );
  return data;
}
