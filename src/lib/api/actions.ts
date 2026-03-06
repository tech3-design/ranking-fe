import { apiClient } from "./client";

export type CrawlFileStatus = "missing" | "needs_improvement" | "good";

export interface CrawlEssentialFile {
  key: "llms" | "robots" | "sitemap";
  label: string;
  url: string;
  found: boolean;
  status: CrawlFileStatus;
  http_status: number | null;
  score: number;
  issues: string[];
  recommendations: string[];
  excerpt: string;
}

export interface CrawlEssentialsResponse {
  submenu_key: string;
  submenu_name: string;
  site_url: string;
  source: "wordpress" | "shopify" | "analyzer_run" | "analyzed_url" | "unknown";
  overall_score: number;
  files: CrawlEssentialFile[];
}

export async function getCrawlEssentialsStatus(
  email: string,
  runId?: number,
  analyzedUrl?: string,
): Promise<CrawlEssentialsResponse> {
  const { data } = await apiClient.get<CrawlEssentialsResponse>(
    "/api/analyzer/actions/crawl-essentials/",
    {
      params: {
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
      },
    },
  );
  return data;
}

export interface AIBlogDraft {
  title: string;
  slug: string;
  meta_description: string;
  excerpt: string;
  content_markdown: string;
  tags: string[];
  llm_raw?: string;
}

export type BlogPublishMode = "auto_publish" | "review_before_publish";
export type BlogJobStatus = "scheduled" | "draft" | "needs_review" | "published" | "failed";

export interface BlogAutomationConfig {
  id: number;
  user_email: string;
  site_url: string;
  topic: string;
  keywords: string[];
  frequency_per_day: number;
  publish_time: string;
  mode: BlogPublishMode;
  publish_provider: "wordpress" | "shopify" | "none";
  is_active: boolean;
  last_queued_for: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogAutomationJob {
  id: number;
  status: BlogJobStatus;
  scheduled_for: string;
  provider: "wordpress" | "shopify" | "none";
  mode: BlogPublishMode;
  topic: string;
  keywords: string[];
  title: string;
  slug: string;
  meta_description: string;
  excerpt: string;
  content_markdown: string;
  tags: string[];
  external_post_id: string;
  external_post_url: string;
  published_at: string | null;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface BlogAutomationGenerateResponse {
  submenu_key: string;
  submenu_name: string;
  site_url: string;
  source: "wordpress" | "shopify" | "analyzer_run" | "analyzed_url" | "unknown";
  publish_provider: "wordpress" | "shopify" | "none";
  draft: AIBlogDraft;
  draft_job?: BlogAutomationJob | null;
}

export interface BlogPublishResponse {
  message: string;
  provider: "wordpress" | "shopify";
  published: {
    id?: number | string;
    url?: string;
    title?: string;
    status?: string;
    published?: boolean;
  };
}

export async function generateAIBlogDraft(params: {
  email: string;
  run_id?: number;
  analyzed_url?: string;
  topic: string;
  keywords?: string[] | string;
  save_as_draft?: boolean;
  activate_automation?: boolean;
}): Promise<BlogAutomationGenerateResponse> {
  const { data } = await apiClient.post<BlogAutomationGenerateResponse>(
    "/api/analyzer/actions/blog-automation/generate/",
    params,
  );
  return data;
}

export async function publishAIBlogDraft(params: {
  email: string;
  draft: AIBlogDraft;
  publish_now?: boolean;
  run_id?: number;
  analyzed_url?: string;
  job_id?: number;
}): Promise<BlogPublishResponse> {
  const { data } = await apiClient.post<BlogPublishResponse>(
    "/api/analyzer/actions/blog-automation/publish/",
    params,
  );
  return data;
}

export async function getBlogAutomationConfig(params: {
  email: string;
  run_id?: number;
  analyzed_url?: string;
}): Promise<{ config: BlogAutomationConfig }> {
  const { data } = await apiClient.get<{ config: BlogAutomationConfig }>(
    "/api/analyzer/actions/blog-automation/config/",
    { params },
  );
  return data;
}

export async function saveBlogAutomationConfig(payload: {
  email: string;
  run_id?: number;
  analyzed_url?: string;
  topic: string;
  keywords: string[] | string;
  frequency_per_day: number;
  publish_time: string;
  mode: BlogPublishMode;
  is_active: boolean;
}): Promise<{ message: string; queued_jobs: number; config: BlogAutomationConfig }> {
  const { data } = await apiClient.post<{ message: string; queued_jobs: number; config: BlogAutomationConfig }>(
    "/api/analyzer/actions/blog-automation/config/",
    payload,
  );
  return data;
}

export async function getBlogAutomationCalendar(params: {
  email: string;
  view?: "week" | "month";
  from?: string;
  to?: string;
}): Promise<{
  summary: Record<BlogJobStatus, number>;
  jobs: BlogAutomationJob[];
}> {
  const { data } = await apiClient.get<{
    summary: Record<BlogJobStatus, number>;
    jobs: BlogAutomationJob[];
  }>("/api/analyzer/actions/blog-automation/calendar/", { params });
  return data;
}

export async function processDueBlogJobs(email: string): Promise<{ message: string; processed: number }> {
  const { data } = await apiClient.post<{ message: string; processed: number }>(
    "/api/analyzer/actions/blog-automation/process-due/",
    { email },
  );
  return data;
}
