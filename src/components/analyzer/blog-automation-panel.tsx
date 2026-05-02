"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Copy, FileText, Loader2, PenSquare, Play, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type AIBlogDraft,
  type BlogAutomationConfig,
  type BlogAutomationJob,
  type BlogJobStatus,
  type BlogPublishMode,
  generateAIBlogDraft,
  getBlogAutomationCalendar,
  getBlogAutomationConfig,
  processDueBlogJobs,
  publishAIBlogDraft,
  saveBlogAutomationConfig,
} from "@/lib/api/actions";

interface BlogAutomationPanelProps {
  email: string;
  runId: number;
  analyzedUrl: string;
}

function statusClass(status: BlogJobStatus) {
  if (status === "published") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
  if (status === "scheduled") return "border-sky-500/30 bg-sky-500/10 text-sky-600";
  if (status === "draft") return "border-slate-500/30 bg-slate-500/10 text-slate-600";
  if (status === "needs_review") return "border-amber-500/30 bg-amber-500/10 text-amber-600";
  return "border-red-500/30 bg-red-500/10 text-red-600";
}

function prettyStatus(status: BlogJobStatus) {
  return status.replaceAll("_", " ");
}

export function BlogAutomationPanel({ email, runId, analyzedUrl }: BlogAutomationPanelProps) {
  const [topic, setTopic] = useState("AI search visibility strategy");
  const [keywords, setKeywords] = useState("AI SEO, GEO, llms.txt, robots.txt");
  const [mode, setMode] = useState<BlogPublishMode>("review_before_publish");
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [publishTime, setPublishTime] = useState("09:00");
  const [isActive, setIsActive] = useState(true);

  const [config, setConfig] = useState<BlogAutomationConfig | null>(null);
  const [jobs, setJobs] = useState<BlogAutomationJob[]>([]);
  const [summary, setSummary] = useState<Record<BlogJobStatus, number>>({
    scheduled: 0,
    draft: 0,
    needs_review: 0,
    published: 0,
    failed: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [publishingJobId, setPublishingJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [draft, setDraft] = useState<AIBlogDraft | null>(null);
  const [publishing, setPublishing] = useState<"draft" | "publish" | null>(null);
  const [copied, setCopied] = useState(false);
  const [calendarView, setCalendarView] = useState<"week" | "month">("month");

  const fetchCalendar = useCallback(async () => {
    const cal = await getBlogAutomationCalendar({ email, view: calendarView });
    setJobs(cal.jobs);
    setSummary(cal.summary);
  }, [email, calendarView]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await getBlogAutomationConfig({
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
      });
      setConfig(cfg.config);
      setTopic(cfg.config.topic || topic);
      setKeywords((cfg.config.keywords || []).join(", "));
      setMode(cfg.config.mode);
      setFrequencyPerDay(cfg.config.frequency_per_day || 1);
      setPublishTime((cfg.config.publish_time || "09:00").slice(0, 5));
      setIsActive(Boolean(cfg.config.is_active));
      await fetchCalendar();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load blog automation.");
    } finally {
      setLoading(false);
    }
  }, [email, runId, analyzedUrl, fetchCalendar, topic]);

  useEffect(() => {
    if (!email) return;
    load();
  }, [email, load]);

  useEffect(() => {
    if (!email) return;
    fetchCalendar().catch(() => {});
  }, [calendarView, email, fetchCalendar]);

  const jobsByDate = useMemo(() => {
    const map: Record<string, BlogAutomationJob[]> = {};
    for (const job of jobs) {
      const key = new Date(job.scheduled_for).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(job);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [jobs]);

  async function handleSaveConfig() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveBlogAutomationConfig({
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
        topic: topic.trim(),
        keywords,
        frequency_per_day: frequencyPerDay,
        publish_time: publishTime,
        mode,
        is_active: isActive,
      });
      setConfig(res.config);
      setMessage(`Saved. ${res.queued_jobs} jobs queued.`);
      await fetchCalendar();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save automation settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProcessDue() {
    setProcessing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await processDueBlogJobs(email);
      setMessage(`Processed ${res.processed} due jobs.`);
      await fetchCalendar();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to process due jobs.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerate(saveAsDraft = false) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await generateAIBlogDraft({
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
        topic: topic.trim(),
        keywords,
        save_as_draft: saveAsDraft,
      });
      setDraft(res.draft);
      if (res.draft_job) {
        setMessage("Draft saved to calendar.");
        await fetchCalendar();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to generate blog draft.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(modeType: "draft" | "publish") {
    if (!draft) return;
    setPublishing(modeType);
    setError(null);
    setMessage(null);
    try {
      const res = await publishAIBlogDraft({
        email,
        draft,
        publish_now: modeType === "publish",
        run_id: runId,
        analyzed_url: analyzedUrl,
      });
      setMessage(
        modeType === "publish"
          ? `Published via ${res.provider}.`
          : `Saved CMS draft via ${res.provider}.`,
      );
      await fetchCalendar();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to publish blog draft.");
    } finally {
      setPublishing(null);
    }
  }

  async function handlePublishJob(jobId: number) {
    setPublishingJobId(jobId);
    setError(null);
    setMessage(null);
    try {
      const res = await publishAIBlogDraft({
        email,
        draft: {
          title: "",
          slug: "",
          meta_description: "",
          excerpt: "",
          content_markdown: "",
          tags: [],
        },
        publish_now: true,
        job_id: jobId,
      });
      setMessage(`Published scheduled job via ${res.provider}.`);
      await fetchCalendar();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to publish scheduled job.");
    } finally {
      setPublishingJobId(null);
    }
  }

  async function handleCopyDraft() {
    if (!draft) return;
    const text = [
      `Title: ${draft.title}`,
      `Slug: ${draft.slug}`,
      `Meta: ${draft.meta_description}`,
      "",
      draft.content_markdown,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  return (
    <Card className="backdrop-blur-xl border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <PenSquare className="size-4 text-primary" />
          AI Blog Automation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily scheduled blogs with Auto Publish or Review mode, plus calendar visibility.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              placeholder="AI visibility content strategy"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Keywords (comma separated)</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              placeholder="GEO, answer engines, llms.txt"
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-border/70 bg-background/60 p-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Frequency/day</label>
            <select
              value={frequencyPerDay}
              onChange={(e) => setFrequencyPerDay(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value={1}>1 per day</option>
              <option value={2}>2 per day</option>
              <option value={3}>3 per day</option>
              <option value={4}>4 per day</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Publish time</label>
            <input
              type="time"
              value={publishTime}
              onChange={(e) => setPublishTime(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as BlogPublishMode)}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="auto_publish">Auto Publish</option>
              <option value="review_before_publish">Review Before Publish</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-background px-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Automation active
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSaveConfig} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Schedule
          </Button>
          <Button variant="outline" onClick={handleProcessDue} disabled={processing} className="gap-2">
            {processing ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            Run Due Jobs
          </Button>
          <Button variant="outline" onClick={() => load()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600">
            {message}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-5">
          {(["published", "scheduled", "draft", "needs_review", "failed"] as BlogJobStatus[]).map((key) => (
            <div key={key} className="rounded-lg border border-border/60 bg-background/60 p-3">
              <p className="text-xs text-muted-foreground">{prettyStatus(key)}</p>
              <p className="text-2xl font-semibold">{summary[key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Draft generation</p>
            <div className="flex gap-2">
              <Button onClick={() => handleGenerate(false)} disabled={loading} className="gap-2" size="sm">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                Generate
              </Button>
              <Button onClick={() => handleGenerate(true)} disabled={loading} variant="outline" size="sm">
                Save as Draft Job
              </Button>
            </div>
          </div>

          {draft && (
            <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{draft.title}</p>
                  <p className="text-xs text-muted-foreground">/{draft.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyDraft} className="gap-1.5">
                    <Copy className="size-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish("draft")}
                    disabled={publishing !== null}
                  >
                    {publishing === "draft" ? <Loader2 className="size-3.5 animate-spin" /> : "CMS Draft"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePublish("publish")}
                    disabled={publishing !== null}
                  >
                    {publishing === "publish" ? <Loader2 className="size-3.5 animate-spin" /> : "Publish"}
                  </Button>
                </div>
              </div>
              <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {draft.content_markdown}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <p className="text-sm font-medium">Content Calendar</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={calendarView === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("week")}
              >
                Week
              </Button>
              <Button
                variant={calendarView === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("month")}
              >
                Month
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {jobsByDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled items yet.</p>
            ) : (
              jobsByDate.map(([date, dayJobs]) => (
                <div key={date} className="rounded-lg border border-border/60 bg-background/60 p-3">
                  <p className="mb-2 text-sm font-medium">{date}</p>
                  <div className="space-y-2">
                    {dayJobs.map((job) => (
                      <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-background/60 p-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{job.title || job.topic || "Scheduled blog"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(job.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(job.status)}`}>
                            {prettyStatus(job.status)}
                          </span>
                          {job.status === "needs_review" && (
                            <Button
                              size="sm"
                              onClick={() => handlePublishJob(job.id)}
                              disabled={publishingJobId === job.id}
                              className="gap-1.5"
                            >
                              {publishingJobId === job.id ? <Loader2 className="size-3.5 animate-spin" /> : "Publish"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {config && (
          <p className="text-xs text-muted-foreground">
            Site: {config.site_url} | Provider: {config.publish_provider}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
