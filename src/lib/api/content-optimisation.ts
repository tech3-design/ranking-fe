import { apiClient, apiClientLong } from "./client";

export type ContentField =
  | "title"
  | "meta_description"
  | "body_html"
  | "schema_jsonld";

export interface ContentPage {
  url: string;
  path: string;
  title: string;
  last_audited_at: string | null;
}

export interface ContentSuggestion {
  id: number;
  title: string;
  rationale: string;
  target_field: ContentField;
  current_excerpt: string;
  proposed_value: string;
  status: "proposed" | "used" | "dismissed";
  created_at: string | null;
}

export interface ContentPageFields {
  url: string;
  title: string;
  meta_description: string;
  body_html: string;
  schema_jsonld: string;
  preview_html: string;
  source: "plugin" | "public" | "empty";
  plugin_connected: boolean;
  plugin_provider: string;
  suggestions: ContentSuggestion[];
}

export interface ContentSaveResult {
  saved: ContentField[];
  failed: { field: ContentField; message: string }[];
  plugin_responses: Record<string, unknown>;
}

export async function getContentPages(slug: string): Promise<ContentPage[]> {
  const { data } = await apiClient.get<{ pages: ContentPage[] }>(
    `/api/analyzer/runs/s/${slug}/content/pages/`,
  );
  return data.pages || [];
}

export async function getContentPageFields(
  slug: string,
  url: string,
): Promise<ContentPageFields> {
  const { data } = await apiClient.get<ContentPageFields>(
    `/api/analyzer/runs/s/${slug}/content/page/`,
    { params: { url } },
  );
  return data;
}

export async function getContentSuggestions(
  slug: string,
  url: string,
): Promise<ContentSuggestion[]> {
  const { data } = await apiClientLong.post<{ suggestions: ContentSuggestion[] }>(
    `/api/analyzer/runs/s/${slug}/content/suggestions/`,
    { url },
    { timeout: 90_000 },
  );
  return data.suggestions || [];
}

export async function dismissContentSuggestion(
  slug: string,
  suggestionId: number,
): Promise<void> {
  await apiClient.post(
    `/api/analyzer/runs/s/${slug}/content/suggestions/${suggestionId}/dismiss/`,
  );
}

export async function saveContentPageEdits(
  slug: string,
  url: string,
  fields: Partial<Record<ContentField, string>>,
  usedSuggestionIds: number[] = [],
): Promise<ContentSaveResult> {
  const { data } = await apiClientLong.post<ContentSaveResult>(
    `/api/analyzer/runs/s/${slug}/content/save/`,
    { url, fields, used_suggestion_ids: usedSuggestionIds },
    { timeout: 45_000 },
  );
  return data;
}
