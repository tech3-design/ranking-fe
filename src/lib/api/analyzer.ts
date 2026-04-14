import { apiClient } from "./client";

export interface StartAnalysisPayload {
  url: string;
  run_type: "single_page" | "full_site";
  email?: string;
  brand_name?: string;
  country?: string;
  org_id?: number;
  /** Backend enforces org ownership, URL match, brand, and non-empty prompts (onboarding / post-checkout). */
  verify_org_workspace?: boolean;
  prompts?: string[];
}

export interface StartAnalysisResponse {
  id: number;
  slug: string;
  url: string;
  status: string;
  message: string;
}

export interface RunStatus {
  id: number;
  status: string;
  progress: number;
  composite_score: number | null;
}

export interface PageScore {
  id: number;
  url: string;
  content_score: number;
  content_details: Record<string, unknown>;
  schema_score: number;
  schema_details: Record<string, unknown>;
  eeat_score: number;
  eeat_details: Record<string, unknown>;
  technical_score: number;
  technical_details: Record<string, unknown>;
  entity_score: number;
  entity_details: Record<string, unknown>;
  ai_visibility_score: number;
  ai_visibility_details: Record<string, unknown>;
  composite_score: number;
}

export interface Competitor {
  id: number;
  name: string;
  url: string;
  industry: string;
  composite_score: number | null;
  scored: boolean;
  page_score: PageScore | null;
}

export interface PlatformStepInfo {
  detail: string;
  code?: string;
}

export interface RecommendationStep {
  n: number;
  title: string;
  detail: string;
  code?: string;
  xp: number;
  shopify?: PlatformStepInfo;
  wordpress?: PlatformStepInfo;
}

export interface Recommendation {
  id: number;
  pillar: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  impact_estimate: string;
  category: string;
  can_auto_fix: boolean;
  steps: RecommendationStep[];
  xp_reward: number;
  difficulty: string;
  estimated_minutes: number;
}

export interface AIProbe {
  id: number;
  prompt_used: string;
  llm_response: string;
  brand_mentioned: boolean;
  confidence: number;
}

export interface AnalysisRunList {
  id: number;
  slug: string;
  url: string;
  country: string;
  run_type: string;
  status: string;
  progress: number;
  composite_score: number | null;
  created_at: string;
}

export interface LLMLog {
  model: string;
  model_id: string;
  purpose: string;
  prompt: string;
  response: string;
  status: "success" | "error";
  duration_ms: number;
}

export interface BrandVisibility {
  google_score: number;
  google_details: Record<string, unknown>;
  reddit_score: number;
  reddit_details: Record<string, unknown>;
  medium_score: number;
  medium_details: Record<string, unknown>;
  web_mentions_score: number;
  web_mentions_details: Record<string, unknown>;
  overall_score: number;
}

export interface AnalysisRunDetail {
  id: number;
  slug: string;
  url: string;
  brand_name: string;
  country: string;
  email: string;
  run_type: string;
  status: string;
  progress: number;
  composite_score: number | null;
  error_message: string;
  created_at: string;
  updated_at: string;
  page_scores: PageScore[];
  competitors: Competitor[];
  recommendations: Recommendation[];
  ai_probes: AIProbe[];
  brand_visibility: BrandVisibility | null;
  llm_logs: LLMLog[];
}

export async function startAnalysis(
  payload: StartAnalysisPayload,
): Promise<StartAnalysisResponse> {
  const { data } = await apiClient.post<StartAnalysisResponse>(
    "/api/analyzer/analyze/",
    payload,
  );
  return data;
}

export async function getRunStatus(runId: number): Promise<RunStatus> {
  const { data } = await apiClient.get<RunStatus>(
    `/api/analyzer/runs/${runId}/status/`,
  );
  return data;
}

export async function getRunDetail(
  runId: number,
): Promise<AnalysisRunDetail> {
  const { data } = await apiClient.get<AnalysisRunDetail>(
    `/api/analyzer/runs/${runId}/`,
  );
  return data;
}

export async function getRunBySlug(slug: string): Promise<AnalysisRunDetail> {
  const { data } = await apiClient.get<AnalysisRunDetail>(
    `/api/analyzer/runs/s/${slug}/`,
  );
  return data;
}

export async function getRunList(
  email: string,
  orgId?: number,
): Promise<AnalysisRunList[]> {
  const params: Record<string, string | number> = orgId
    ? { org_id: orgId }
    : { email };
  const { data } = await apiClient.get<AnalysisRunList[]>(
    "/api/analyzer/runs/",
    { params },
  );
  return data;
}

export function getExportPDFUrl(runId: number): string {
  return `/api/analyzer/runs/${runId}/export-pdf/`;
}

// ── Prompt Tracking ───────────────────────────────────────────────────────

export type Engine = "chatgpt" | "claude" | "gemini" | "perplexity" | "google";
export type Sentiment = "positive" | "neutral" | "negative";

export interface PromptResult {
  id: number;
  engine: Engine;
  response_text: string;
  brand_mentioned: boolean;
  sentiment: Sentiment;
  confidence: number;
  rank_position: number;
  checked_at: string;
}

export interface PromptTrack {
  id: number;
  prompt_text: string;
  is_custom: boolean;
  score: number;
  created_at: string;
  results: PromptResult[];
  visibility_pct: number;
  avg_position: number;
  sentiment_label: string;
  ranking_label: string;
  total_runs: number;
  mentions: number;
}

export interface ShareOfVoiceItem {
  engine: Engine;
  total: number;
  mentioned: number;
  sov_pct: number;
}

export interface CitationTrendPoint {
  week_start: string;
  engine: Engine;
  rate_pct: number;
}

export async function getPromptTracks(slug: string): Promise<PromptTrack[]> {
  const { data } = await apiClient.get<PromptTrack[]>(
    `/api/analyzer/runs/s/${slug}/prompts/`,
  );
  return data;
}

export async function addPromptTrack(
  slug: string,
  prompt_text: string,
): Promise<PromptTrack> {
  const { data } = await apiClient.post<PromptTrack>(
    `/api/analyzer/runs/s/${slug}/prompts/`,
    { prompt_text },
  );
  return data;
}

export async function getShareOfVoice(slug: string): Promise<ShareOfVoiceItem[]> {
  const { data } = await apiClient.get<ShareOfVoiceItem[]>(
    `/api/analyzer/runs/s/${slug}/share-of-voice/`,
  );
  return data;
}

export async function getCitationTrend(slug: string): Promise<CitationTrendPoint[]> {
  const { data } = await apiClient.get<CitationTrendPoint[]>(
    `/api/analyzer/runs/s/${slug}/citation-trend/`,
  );
  return data;
}

export async function recheckPrompt(slug: string, trackId: number): Promise<void> {
  await apiClient.post(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/recheck/`);
}

export async function recheckAllPrompts(slug: string): Promise<{ count: number }> {
  const { data } = await apiClient.post<{ status: string; count: number }>(
    `/api/analyzer/runs/s/${slug}/recheck-all/`,
  );
  return { count: data.count };
}

// ---------- Competitor CRUD ----------

export async function addCompetitor(slug: string, name: string, url: string): Promise<Competitor> {
  const { data } = await apiClient.post<Competitor>(
    `/api/analyzer/runs/s/${slug}/competitors/`,
    { name, url },
  );
  return data;
}

export async function updateCompetitor(slug: string, id: number, payload: { name?: string; url?: string }): Promise<Competitor> {
  const { data } = await apiClient.patch<Competitor>(
    `/api/analyzer/runs/s/${slug}/competitors/${id}/`,
    payload,
  );
  return data;
}

export async function deleteCompetitor(slug: string, id: number): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${slug}/competitors/${id}/`);
}

// ── Score History ─────────────────────────────────────────────────────────

export interface ScoreHistoryPoint {
  date: string;
  composite_score: number;
  slug: string;
}

export async function getScoreHistory(
  email: string,
  orgId?: number,
): Promise<ScoreHistoryPoint[]> {
  const params: Record<string, string | number> = orgId
    ? { org_id: orgId }
    : { email };
  const { data } = await apiClient.get<ScoreHistoryPoint[]>(
    "/api/analyzer/runs/history/",
    { params },
  );
  return data;
}

// ── Scheduled Analysis ────────────────────────────────────────────────────

export interface ScheduledAnalysis {
  id: number;
  email: string;
  url: string;
  brand_name: string;
  frequency: "weekly" | "monthly";
  next_run_at: string;
  last_run_at: string | null;
  last_run_slug: string;
  is_active: boolean;
  created_at: string;
}

export async function getSchedule(
  email: string,
  orgId: number,
): Promise<ScheduledAnalysis | null> {
  const { data } = await apiClient.get<ScheduledAnalysis | null>(
    "/api/analyzer/schedule/",
    { params: { email, org_id: orgId } },
  );
  return data;
}

export async function toggleSchedule(payload: {
  email: string;
  org_id: number;
  url: string;
  brand_name?: string;
  frequency: "weekly" | "monthly";
  is_active: boolean;
}): Promise<ScheduledAnalysis> {
  const { data } = await apiClient.post<ScheduledAnalysis>(
    "/api/analyzer/schedule/",
    payload,
  );
  return data;
}

// ── Auto-Fix ──────────────────────────────────────────────────────────────

export interface AutoFixResult {
  recommendation_id: number;
  status: "success" | "partial" | "failed" | "verified" | "manual";
  message: string;
  fix_type: string;
  generated_content?: string | null;
}

export async function applyAutoFix(
  slug: string,
  recommendationIds: number[],
  email: string,
  orgId?: number,
): Promise<AutoFixResult[]> {
  const { data } = await apiClient.post<AutoFixResult[]>(
    `/api/analyzer/runs/s/${slug}/auto-fix/`,
    { recommendation_ids: recommendationIds, email, org_id: orgId },
    { timeout: 120_000 },
  );
  return data;
}

export async function getAutoFixStatus(slug: string): Promise<AutoFixResult[]> {
  const { data } = await apiClient.get<AutoFixResult[]>(
    `/api/analyzer/runs/s/${slug}/auto-fix/`,
  );
  return data;
}

// ── Preview + Approve Fix Flow ───────────────────────────────────────────

export interface FixPreview {
  status: "preview" | "error" | "manual";
  fix_type: string;
  recommendation_id: number;
  recommendation_title: string;
  original: string;
  preview: string;
  full_content: string;
  target_post_id?: number;
  target_type?: string;
  message?: string;
}

export async function previewFix(
  slug: string,
  recommendationId: number,
  email: string,
): Promise<FixPreview> {
  const { data } = await apiClient.post<FixPreview>(
    `/api/analyzer/runs/s/${slug}/auto-fix/preview/`,
    { recommendation_id: recommendationId, email },
    { timeout: 120_000 },
  );
  return data;
}

export async function approveFix(
  slug: string,
  recommendationId: number,
  content: string,
  fixType: string,
): Promise<AutoFixResult> {
  const { data } = await apiClient.post<AutoFixResult>(
    `/api/analyzer/runs/s/${slug}/auto-fix/approve/`,
    { recommendation_id: recommendationId, content, fix_type: fixType },
    { timeout: 30_000 },
  );
  return data;
}

export async function verifyFix(
  slug: string,
  recommendationId: number,
): Promise<AutoFixResult> {
  const { data } = await apiClient.post<AutoFixResult>(
    `/api/analyzer/runs/s/${slug}/auto-fix/verify/`,
    { recommendation_id: recommendationId },
    { timeout: 45_000 },
  );
  return data;
}
