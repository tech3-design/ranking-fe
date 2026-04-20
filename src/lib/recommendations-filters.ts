import type { Recommendation } from "@/lib/api/analyzer";

export const RECOMMENDATION_PILLAR_LABELS: Record<string, string> = {
  content: "Content",
  schema: "Schema",
  eeat: "E-E-A-T",
  technical: "Technical",
  entity: "Entity",
  ai_visibility: "AI Visibility",
};

export type RecommendationStatusFilter = "all" | "done" | "open" | "action";

export function uniqueRecommendationPillars(items: Recommendation[]): string[] {
  return Array.from(new Set(items.map((r) => r.pillar))).sort();
}

/**
 * Client-side filter for the recommendations table (search + pillar + priority + fix status).
 */
export function filterRecommendations(
  items: Recommendation[],
  fixResults: Record<number, { status: string; message?: string }> | undefined,
  query: string,
  pillarFilter: string,
  priorityFilter: string,
  statusFilter: RecommendationStatusFilter,
): Recommendation[] {
  const q = query.trim().toLowerCase();
  const frMap = fixResults ?? {};
  return items.filter((rec) => {
    if (pillarFilter !== "all" && rec.pillar !== pillarFilter) return false;
    if (priorityFilter !== "all" && rec.priority !== priorityFilter) return false;

    const fr = frMap[rec.id];
    const verified = fr?.status === "success" || fr?.status === "verified";
    if (statusFilter === "done" && !verified) return false;
    if (statusFilter === "open" && verified) return false;
    if (statusFilter === "action") {
      const st = fr?.status;
      if (!st || verified) return false;
      if (st !== "manual" && st !== "failed") return false;
    }

    if (!q) return true;
    const pillarLabel = RECOMMENDATION_PILLAR_LABELS[rec.pillar] ?? rec.pillar;
    const blob = [
      rec.title,
      rec.description,
      rec.action,
      rec.category,
      rec.pillar,
      pillarLabel,
      rec.impact_estimate,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

export function recommendationFiltersActive(
  query: string,
  pillarFilter: string,
  priorityFilter: string,
  statusFilter: RecommendationStatusFilter,
): boolean {
  return (
    query.trim() !== "" ||
    pillarFilter !== "all" ||
    priorityFilter !== "all" ||
    statusFilter !== "all"
  );
}
