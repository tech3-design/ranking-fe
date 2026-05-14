import { apiClient } from "./client";

export interface SocialEntry {
  platform: string;
  handle: string;
}

export type AudienceSize = "<1k" | "1k-10k" | "10k-100k" | "100k-1m" | "1m+" | "";

export type PayoutMethod = "wise" | "paypal" | "bank" | "crypto" | "other";

export interface CreatorApplyPayload {
  name: string;
  email: string;
  country: string; // ISO alpha-2
  social_platforms: SocialEntry[];
  audience_size?: AudienceSize;
  payout_method: PayoutMethod;
  payout_details: string;
}

export interface CreatorApplyResponse {
  code: string;
  name: string;
  share_url: string;
  dashboard_url: string;
  status: string;
  commission_percent: number;
  created: boolean;
}

export type CommissionBucket = "pending" | "locked" | "paid" | "cancelled";

export interface CommissionRow {
  created_at: string;
  referee_email: string; // already masked server-side
  commission_amount: number;
  currency: string;
  status: "pending" | "paid" | "cancelled";
  bucket: CommissionBucket;
}

export interface CreatorStatsBucket {
  count: number;
  amount: number;
}

export interface CreatorStatsResponse {
  code: string;
  name: string;
  country: string;
  social_platforms: SocialEntry[];
  status: string;
  commission_percent: number;
  created_at: string;
  share_url: string;
  dashboard_url: string;
  stats: {
    attributions_total: number;
    attributions_active: number;
    pending: CreatorStatsBucket;
    locked: CreatorStatsBucket;
    paid: CreatorStatsBucket;
    lock_window_days: number;
  };
  recent_commissions: CommissionRow[];
}

export async function applyToCreatorsProgram(
  payload: CreatorApplyPayload,
): Promise<CreatorApplyResponse> {
  const { data } = await apiClient.post<CreatorApplyResponse>(
    "/api/partners/apply/",
    payload,
  );
  return data;
}

export async function getCreatorStats(code: string): Promise<CreatorStatsResponse> {
  const { data } = await apiClient.get<CreatorStatsResponse>(
    "/api/partners/stats/",
    { params: { code } },
  );
  return data;
}
