"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ExternalLink } from "lucide-react";
import { BrowserChrome } from "@/components/optimisation/browser-chrome";
import { PageIframe } from "@/components/optimisation/page-iframe";
import { SuggestionsRail } from "@/components/optimisation/suggestions-rail";
import {
  dismissContentSuggestion,
  getContentPageFields,
  getContentPages,
  getContentSuggestions,
  saveContentPageEdits,
  type ContentPage,
  type ContentPageFields,
  type ContentSuggestion,
} from "@/lib/api/content-optimisation";

export default function ContentOptimisationPage() {
  const { slug } = useParams<{ slug: string }>();

  const [pages, setPages] = useState<ContentPage[]>([]);
  const [url, setUrl] = useState("");
  const [pageFields, setPageFields] = useState<ContentPageFields | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // browser-style history for back/forward
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const navigatingFromHistory = useRef(false);

  // Load pages once per project
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getContentPages(slug)
      .then((p) => {
        if (cancelled) return;
        setPages(p);
        if (p.length > 0 && !url) setUrl(p[0].url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadPage = useCallback(
    async (target: string) => {
      if (!slug || !target) return;
      setPageLoading(true);
      setPageError(null);
      setAppliedIds(new Set());
      setError(null);
      setNotice(null);
      try {
        const data = await getContentPageFields(slug, target);
        setPageFields(data);
        setSuggestions(data.suggestions || []);
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setPageError(detail || "Couldn't load this page.");
        setPageFields(null);
        setSuggestions([]);
      } finally {
        setPageLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    if (!url) return;
    loadPage(url);
    if (!navigatingFromHistory.current) {
      setHistory((h) => {
        const next = h.slice(0, historyIdx + 1);
        next.push(url);
        return next;
      });
      setHistoryIdx((idx) => idx + 1);
    }
    navigatingFromHistory.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  async function handleGenerateSuggestions() {
    if (!slug || !url) return;
    setGenerating(true);
    setSuggestionsLoading(true);
    try {
      const fresh = await getContentSuggestions(slug, url);
      setSuggestions(fresh);
      setAppliedIds(new Set());
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Couldn't generate suggestions.");
    } finally {
      setGenerating(false);
      setSuggestionsLoading(false);
    }
  }

  async function handleApplySuggestion(s: ContentSuggestion) {
    if (!slug || !url) return;
    setApplyingId(s.id);
    setError(null);
    setNotice(null);
    try {
      const result = await saveContentPageEdits(
        slug,
        url,
        { [s.target_field]: s.proposed_value },
        [s.id],
      );
      const ok = result.saved.length > 0 && result.failed.length === 0;
      if (ok) {
        setAppliedIds((curr) => new Set(curr).add(s.id));
        setNotice(`Applied: ${s.title}`);
        // Re-fetch the live page so the iframe reflects the change.
        const fresh = await getContentPageFields(slug, url);
        setPageFields(fresh);
      } else {
        const msg = result.failed[0]?.message || "Plugin returned an error.";
        setError(`Couldn't apply "${s.title}": ${msg}`);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 503) {
        setError(detail || "Connect WordPress or Shopify to apply this change.");
      } else {
        setError(detail || "Couldn't push the change to the plugin.");
      }
    } finally {
      setApplyingId(null);
    }
  }

  async function handleDismissSuggestion(s: ContentSuggestion) {
    setSuggestions((list) => list.filter((x) => x.id !== s.id));
    try {
      await dismissContentSuggestion(slug, s.id);
    } catch {
      // best-effort
    }
  }

  function handleBack() {
    if (historyIdx <= 0) return;
    navigatingFromHistory.current = true;
    setHistoryIdx(historyIdx - 1);
    setUrl(history[historyIdx - 1]);
  }

  function handleForward() {
    if (historyIdx >= history.length - 1) return;
    navigatingFromHistory.current = true;
    setHistoryIdx(historyIdx + 1);
    setUrl(history[historyIdx + 1]);
  }

  function handleRefresh() {
    if (url) loadPage(url);
  }

  const pluginConnected = !!pageFields?.plugin_connected;
  const applyDisabledHint = pluginConnected
    ? undefined
    : "Connect WordPress or Shopify in Settings → Integrations to apply changes.";

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-0 flex-col">
      <BrowserChrome
        url={url}
        pages={pages}
        canGoBack={historyIdx > 0}
        canGoForward={historyIdx >= 0 && historyIdx < history.length - 1}
        isLoading={pageLoading}
        onUrlChange={(next) => setUrl(next)}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
      />

      {(error || notice || (!pluginConnected && pageFields)) && (
        <div className="flex flex-col gap-1 border-b border-border bg-muted/15 px-3 py-2">
          {!pluginConnected && pageFields ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <AlertCircle className="size-3.5" />
              <span>
                No plugin connected. AI suggestions will preview here, but applying needs
                WordPress or Shopify.
              </span>
              <Link
                href={`/dashboard/${slug}/settings/integrations`}
                className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
              >
                Connect <ExternalLink className="size-3" />
              </Link>
            </div>
          ) : null}
          {error ? (
            <p className="text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
          ) : null}
          {notice ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{notice}</p>
          ) : null}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="flex-1 min-w-0 border-r border-border">
          <PageIframe
            previewHtml={pageFields?.preview_html || ""}
            isLoading={pageLoading}
            emptyMessage={pageError || undefined}
          />
        </div>

        <div className="w-[360px] min-w-[300px] shrink-0">
          <SuggestionsRail
            suggestions={suggestions}
            applyingId={applyingId}
            appliedIds={appliedIds}
            isLoading={suggestionsLoading}
            isGenerating={generating}
            hasPage={!!pageFields}
            applyDisabled={!pluginConnected}
            applyDisabledHint={applyDisabledHint}
            onGenerate={handleGenerateSuggestions}
            onApply={handleApplySuggestion}
            onDismiss={handleDismissSuggestion}
          />
        </div>
      </div>
    </div>
  );
}
