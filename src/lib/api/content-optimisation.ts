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

export interface PreviewElementBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PreviewElement {
  id: number;
  tag: string;
  text: string;
  bbox: PreviewElementBBox;
}

export interface ContentPageFields {
  url: string;
  title: string;
  meta_description: string;
  body_html: string;
  schema_jsonld: string;
  preview_image: string;
  preview_elements: PreviewElement[];
  preview_viewport_width: number;
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
  // Long timeout because the BE renders the URL in headless Chromium to
  // produce the preview screenshot — typically 4–10s per page.
  const { data } = await apiClientLong.get<ContentPageFields>(
    `/api/analyzer/runs/s/${slug}/content/page/`,
    { params: { url }, timeout: 45_000 },
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

export async function rewriteElement(
  slug: string,
  tag: string,
  text: string,
  instruction = "",
): Promise<string> {
  const { data } = await apiClientLong.post<{ new_text: string }>(
    `/api/analyzer/runs/s/${slug}/content/rewrite-element/`,
    { tag, text, instruction },
    { timeout: 60_000 },
  );
  return data.new_text || "";
}

export async function applyElementEdit(
  slug: string,
  url: string,
  originalText: string,
  newText: string,
): Promise<ContentSaveResult & { noop?: boolean }> {
  const { data } = await apiClientLong.post<ContentSaveResult & { noop?: boolean }>(
    `/api/analyzer/runs/s/${slug}/content/apply-element/`,
    { url, original_text: originalText, new_text: newText },
    { timeout: 45_000 },
  );
  return data;
}
