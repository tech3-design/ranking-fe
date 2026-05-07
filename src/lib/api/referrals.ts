import { apiClient } from "./client";

export type ReferralStatus = "pending" | "paid" | "cancelled";

export interface ReferralEntry {
  referee_email: string;
  status: ReferralStatus;
  created_at: string;
  paid_at: string | null;
}

export interface ReferralStats {
  total: number;
  pending: number;
  paid: number;
  cancelled: number;
  rewards_applied: number;
  pending_reward: { percent_off: number; created_at: string } | null;
}

export interface ReferralMeResponse {
  email: string;
  code: string;
  share_url: string;
  referrals: ReferralEntry[];
  stats: ReferralStats;
}

export interface ReferralRedeemResponse {
  referrer_email: string;
  referee_email: string;
  status: ReferralStatus;
  discount_percent: number;
}

export async function getReferralMe(email: string): Promise<ReferralMeResponse> {
  const { data } = await apiClient.get<ReferralMeResponse>("/api/referrals/me/", {
    params: { email },
  });
  return data;
}

export async function redeemReferralCode(
  code: string,
  email: string,
): Promise<ReferralRedeemResponse> {
  const { data } = await apiClient.post<ReferralRedeemResponse>(
    "/api/referrals/redeem/",
    { code, email },
  );
  return data;
}
