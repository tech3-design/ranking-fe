import { apiClient } from "./client";

export interface StartAnalysisPayload {
  url: string;
  run_type: "single_page" | "full_site";
  email?: string;
  brand_name?: string;
}

export interface StartAnalysisResponse {
  id: number;
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

export interface Recommendation {
  id: number;
  pillar: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  impact_estimate: string;
  category: string;
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
  url: string;
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
  url: string;
  brand_name: string;
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

export async function getRunList(
  email: string,
): Promise<AnalysisRunList[]> {
  const { data } = await apiClient.get<AnalysisRunList[]>(
    "/api/analyzer/runs/",
    { params: { email } },
  );
  return data;
}

export function getExportPDFUrl(runId: number): string {
  return `/api/analyzer/runs/${runId}/export-pdf/`;
}
