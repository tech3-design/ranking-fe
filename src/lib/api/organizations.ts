import { apiClient } from "./client";

interface OnboardPayload {
  name: string;
  url: string;
  email: string;
}

interface OnboardResponse {
  id: number;
  name: string;
  url: string;
}

interface CheckResponse {
  exists: boolean;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function createOrganization(
  payload: OnboardPayload,
): Promise<OnboardResponse> {
  const { data } = await apiClient.post<OnboardResponse>(
    "/api/organizations/onboard/",
    { ...payload, email: normalizeEmail(payload.email) },
  );
  return data;
}

export async function checkOrganizationExists(
  email: string,
): Promise<boolean> {
  const { data } = await apiClient.get<CheckResponse>(
    "/api/organizations/check/",
    { params: { email: normalizeEmail(email) } },
  );
  return data.exists;
}
