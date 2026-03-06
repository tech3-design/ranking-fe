import { apiClient } from "./client";

interface OnboardPayload {
  name: string;
  url: string;
  email: string;
}

interface CheckResponse {
  exists: boolean;
}

export interface Organization {
  id: number;
  name: string;
  url: string;
  owner_email: string;
  created_at: string;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function createOrganization(
  payload: OnboardPayload,
): Promise<Organization> {
  const { data } = await apiClient.post<Organization>(
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

export async function getOrganizations(email: string): Promise<Organization[]> {
  const { data } = await apiClient.get<Organization[]>(
    "/api/organizations/",
    { params: { email: normalizeEmail(email) } },
  );
  return data;
}

export async function updateOrganization(
  id: number,
  payload: { name?: string; url?: string },
): Promise<Organization> {
  const { data } = await apiClient.patch<Organization>(
    `/api/organizations/${id}/`,
    payload,
  );
  return data;
}

export async function deleteOrganization(id: number): Promise<void> {
  await apiClient.delete(`/api/organizations/${id}/`);
}
