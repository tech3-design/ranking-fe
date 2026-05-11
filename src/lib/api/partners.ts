import { apiClient } from "./client";

export interface PartnerAttributeResponse {
  partner_code: string;
  expires_at: string;
}

export interface PartnerTrackResponse {
  valid: boolean;
  partner_name?: string;
}

export async function attributePartner(
  code: string,
  email: string,
  landingPath?: string,
): Promise<PartnerAttributeResponse> {
  const { data } = await apiClient.post<PartnerAttributeResponse>(
    "/api/partners/attribute/",
    { code, email, landing_path: landingPath ?? "" },
  );
  return data;
}

export async function trackPartnerClick(code: string): Promise<PartnerTrackResponse> {
  const { data } = await apiClient.post<PartnerTrackResponse>(
    "/api/partners/track/",
    { code },
  );
  return data;
}
