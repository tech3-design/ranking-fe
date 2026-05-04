"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useRun } from "../_components/run-context";
import { RecommendationsPanel } from "@/components/analyzer/recommendations-panel";
import { getIntegrationStatus } from "@/lib/api/integrations";
import {
  filterRecommendations,
  recommendationFiltersActive,
  uniqueRecommendationPillars,
  RECOMMENDATION_PILLAR_LABELS,
  type RecommendationStatusFilter,
} from "@/lib/recommendations-filters";
import { AlertCircle, Search, X } from "lucide-react";
import { RecommendationsSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function detectPlatform(url?: string, integrations?: { provider: string; is_active: boolean }[]): "shopify" | "wordpress" | undefined {
  if (integrations) {
    if (integrations.some((i) => i.provider === "shopify" && i.is_active)) return "shopify";
    if (integrations.some((i) => i.provider === "wordpress" && i.is_active)) return "wordpress";
  }
  if (url?.includes(".myshopify.com")) return "shopify";
  return undefined;
}

export default function RecommendationsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { run, loading, error, fixResults, setFixResult } = useRun();
  const [platform, setPlatform] = useState<"shopify" | "wordpress" | undefined>();

  const [searchQuery, setSearchQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<RecommendationStatusFilter>("all");

  const email = session?.user?.email ?? "";

  const allRecs = run?.recommendations ?? [];

  const pillarOptions = useMemo(() => uniqueRecommendationPillars(allRecs), [allRecs]);

  const filteredRecommendations = useMemo(
    () =>
      filterRecommendations(allRecs, fixResults, searchQuery, pillarFilter, priorityFilter, statusFilter),
    [allRecs, fixResults, searchQuery, pillarFilter, priorityFilter, statusFilter],
  );

  const filtersActive = recommendationFiltersActive(searchQuery, pillarFilter, priorityFilter, statusFilter);

  useEffect(() => {
    if (!email) return;
    getIntegrationStatus(email)
      .then((integrations) => setPlatform(detectPlatform(run?.url, integrations)))
      .catch(() => setPlatform(detectPlatform(run?.url)));
  }, [email, run?.url]);

  return (
    <div className="space-y-6 px-2 py-2">
      {run && !loading && allRecs.length > 0 ? (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Fixes</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filtersActive ? (
                <>
                  Showing{" "}
                  <span className="font-medium text-foreground">{filteredRecommendations.length}</span>
                  {" of "}
                  {allRecs.length} items to improve your GEO score
                </>
              ) : (
                <>
                  {allRecs.length} item{allRecs.length !== 1 ? "s" : ""} to improve your GEO score
                </>
              )}
            </p>
          </div>
          <div className="flex w-full min-w-0 shrink-0 md:w-auto md:max-w-[min(100%,52rem)] lg:max-w-none">
            <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-end">
              <div className="relative min-w-[10.5rem] max-w-[14rem] shrink-0 sm:min-w-[12rem] md:max-w-[16rem]">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recommendations…"
                  className="h-9 border border-border/80 bg-white pl-9 pr-9 text-sm text-foreground shadow-sm focus-visible:ring-0 focus-visible:border-border dark:bg-white dark:text-foreground"
                  aria-label="Search recommendations"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-200"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
              <Select value={pillarFilter} onValueChange={setPillarFilter}>
                <SelectTrigger
                  size="sm"
                  className="h-9 w-[8.5rem] shrink-0 border border-border/80 bg-white text-foreground shadow-sm sm:w-36 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
                >
                  <SelectValue placeholder="Pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pillars</SelectItem>
                  {pillarOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {RECOMMENDATION_PILLAR_LABELS[p] ?? p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger
                  size="sm"
                  className="h-9 w-[7.5rem] shrink-0 border border-border/80 bg-white text-foreground shadow-sm sm:w-32 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
                >
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as RecommendationStatusFilter)}
              >
                <SelectTrigger
                  size="sm"
                  className="h-9 w-[9.5rem] shrink-0 border border-border/80 bg-white text-foreground shadow-sm sm:w-40 dark:bg-white dark:text-foreground dark:hover:bg-neutral-50"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Not verified</SelectItem>
                  <SelectItem value="done">Verified / done</SelectItem>
                  <SelectItem value="action">Needs attention</SelectItem>
                </SelectContent>
              </Select>
              {filtersActive ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 border-border/80 bg-white px-2.5 text-xs text-muted-foreground shadow-sm hover:bg-neutral-50 dark:bg-white dark:text-foreground dark:hover:bg-neutral-100"
                  onClick={() => {
                    setSearchQuery("");
                    setPillarFilter("all");
                    setPriorityFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Fixes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {run ? `${run.recommendations.length} items to improve your GEO score` : "Loading…"}
          </p>
        </div>
      )}

      {loading && <RecommendationsSkeleton />}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm text-primary">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {run && !loading && allRecs.length > 0 && (
        <RecommendationsPanel
          recommendations={filteredRecommendations}
          allRecommendations={allRecs}
          slug={slug}
          email={email}
          platform={platform}
          initialFixResults={fixResults}
          onFixResult={setFixResult}
        />
      )}

      {run && !loading && allRecs.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">No recommendations found for this analysis run.</div>
      )}
    </div>
  );
}
