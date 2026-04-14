import { apiClient } from "./client";

/** Backend `dodo_mode` when checkout fails (no secrets). */
export type DodoMode = "live" | "test";

export class CheckoutSessionError extends Error {
  readonly dodoMode?: DodoMode;

  constructor(message: string, dodoMode?: DodoMode) {
    super(message);
    this.name = "CheckoutSessionError";
    this.dodoMode = dodoMode;
  }
}

export interface PlanLimits {
  label: string;
  price_gbp: number;
  max_projects: number;
  max_prompts: number;
  engines: string[];
}

export interface SubscriptionStatus {
  is_active: boolean;
  status: string;
  current_period_end: string | null;
  currency: string;
  plan: string;
  plan_label: string;
  limits: PlanLimits;
  /** True when backend has a Dodo payment_id and PDF can be downloaded */
  invoice_available?: boolean;
}

export async function createCheckoutSession(
  email: string,
  plan: string = "starter",
): Promise<{ checkout_url: string }> {
  try {
    const { data } = await apiClient.post<{ checkout_url: string; error?: string }>(
      "/api/payments/create-checkout/",
      { email, plan },
    );
    return data;
  } catch (err: unknown) {
    const ax = err as {
      response?: { data?: { error?: string; dodo_mode?: string } };
      message?: string;
    };
    const msg =
      ax.response?.data?.error ||
      ax.message ||
      "Failed to start checkout. Please try again.";
    const raw = ax.response?.data?.dodo_mode;
    const dodoMode: DodoMode | undefined =
      raw === "live" || raw === "test" ? raw : undefined;
    throw new CheckoutSessionError(msg, dodoMode);
  }
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
