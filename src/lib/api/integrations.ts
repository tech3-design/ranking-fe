import { apiClient } from "./client";

// ---------- Types ----------

export interface IntegrationInfo {
  id: number;
  provider: "google_analytics" | "shopify";
  provider_display: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GA4Property {
  property_id: string;
  display_name: string;
  account_name: string;
}

export interface GADataSnapshot {
  id: number;
  date_start: string;
  date_end: string;
  sessions: number;
  organic_sessions: number;
  bounce_rate: number;
  avg_session_duration: number;
  top_pages: Array<{
    path: string;
    sessions: number;
    bounce_rate: number;
    avg_duration: number;
  }>;
  traffic_sources: Array<{
    source: string;
    medium: string;
    sessions: number;
  }>;
  daily_trend: Array<{
    date: string;
    sessions: number;
    organic_sessions: number;
  }>;
  sync_status: "pending" | "syncing" | "complete" | "failed";
  error_message: string;
  created_at: string;
}

// ---------- OAuth ----------

export async function getGAAuthUrl(email: string): Promise<{ auth_url: string }> {
  const { data } = await apiClient.get<{ auth_url: string }>(
    "/api/integrations/google-analytics/auth-url/",
    { params: { email } },
  );
  return data;
}

export async function sendGACallback(
  code: string,
  state: string,
): Promise<{ message: string; integration: IntegrationInfo }> {
  const { data } = await apiClient.post(
    "/api/integrations/google-analytics/callback/",
    { code, state },
  );
  return data;
}

export async function disconnectGA(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(
    "/api/integrations/google-analytics/disconnect/",
    { params: { email } },
  );
  return data;
}

// ---------- Status ----------

export async function getIntegrationStatus(
  email: string,
): Promise<IntegrationInfo[]> {
  const { data } = await apiClient.get<IntegrationInfo[]>(
    "/api/integrations/status/",
    { params: { email } },
  );
  return data;
}

// ---------- Properties ----------

export async function getGAProperties(
  email: string,
): Promise<{ properties: GA4Property[] }> {
  const { data } = await apiClient.get<{ properties: GA4Property[] }>(
    "/api/integrations/google-analytics/properties/",
    { params: { email } },
  );
  return data;
}

export async function selectGAProperty(
  email: string,
  propertyId: string,
  propertyName: string,
): Promise<{ message: string; integration: IntegrationInfo }> {
  const { data } = await apiClient.post(
    "/api/integrations/google-analytics/select-property/",
    { email, property_id: propertyId, property_name: propertyName },
  );
  return data;
}

// ---------- Data ----------

export async function syncGAData(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post(
    "/api/integrations/google-analytics/sync/",
    null,
    { params: { email } },
  );
  return data;
}

export async function getGAData(email: string): Promise<GADataSnapshot> {
  const { data } = await apiClient.get<GADataSnapshot>(
    "/api/integrations/google-analytics/data/",
    { params: { email } },
  );
  return data;
}

// ---------- Shopify Types ----------

export interface ShopifyDataSnapshot {
  id: number;
  date_start: string;
  date_end: string;
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
  total_customers: number;
  top_products: Array<{
    title: string;
    quantity_sold: number;
    revenue: string;
    product_id: string;
  }>;
  daily_orders: Array<{
    date: string;
    orders: number;
    revenue: string;
  }>;
  sync_status: "pending" | "syncing" | "complete" | "failed";
  error_message: string;
  created_at: string;
}

// ---------- Shopify API ----------

export async function connectShopify(
  email: string,
  shopDomain: string,
  accessToken: string,
): Promise<{ message: string; integration: IntegrationInfo }> {
  const { data } = await apiClient.post(
    "/api/integrations/shopify/connect/",
    { email, shop_domain: shopDomain, access_token: accessToken },
  );
  return data;
}

export async function disconnectShopify(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.delete(
    "/api/integrations/shopify/disconnect/",
    { params: { email } },
  );
  return data;
}

export async function syncShopifyData(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post(
    "/api/integrations/shopify/sync/",
    null,
    { params: { email } },
  );
  return data;
}

export async function getShopifyData(
  email: string,
): Promise<ShopifyDataSnapshot> {
  const { data } = await apiClient.get<ShopifyDataSnapshot>(
    "/api/integrations/shopify/data/",
    { params: { email } },
  );
  return data;
}

// ---------- Correlation ----------

export interface CorrelationDataPoint {
  date: string;
  geo_score: number;
  sessions: number | null;
  organic_sessions: number | null;
  url: string;
}

export interface CorrelationResponse {
  data_points: CorrelationDataPoint[];
  has_ga_data: boolean;
}

export async function getScoreTrafficCorrelation(
  email: string,
): Promise<CorrelationResponse> {
  const { data } = await apiClient.get<CorrelationResponse>(
    "/api/integrations/score-traffic-correlation/",
    { params: { email } },
  );
  return data;
}
