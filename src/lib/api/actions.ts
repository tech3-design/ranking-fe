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
