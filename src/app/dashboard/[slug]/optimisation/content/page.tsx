"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertCircle, ExternalLink } from "@/components/icons";
import { BrowserChrome } from "@/components/optimisation/browser-chrome";
import { PageIframe } from "@/components/optimisation/page-iframe";
import { ElementEditor } from "@/components/optimisation/element-editor";
import { useRun } from "../../_components/run-context";
import {
  applyElementEdit,
  getContentPageFields,
  getContentPages,
  rewriteElement,
  type ContentPage,
  type ContentPageFields,
  type PreviewElement,
} from "@/lib/api/content-optimisation";

export default function ContentOptimisationPage() {
  const { slug } = useParams<{ slug: string }>();
  const { run } = useRun();

  const [url, setUrl] = useState("");
  const [pageFields, setPageFields] = useState<ContentPageFields | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cursor-style element-level edit. The right rail only mounts while an
  // element is selected; otherwise the preview fills the full width.
  const [selectedElement, setSelectedElement] = useState<PreviewElement | null>(null);
  const [rewritingElement, setRewritingElement] = useState(false);
  const [applyingElement, setApplyingElement] = useState(false);

  // browser-style history for back/forward
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const navigatingFromHistory = useRef(false);

  // Cached across tab switches via QueryClient (5min staleTime, 30min gcTime).
  const { data: pages = [] as ContentPage[] } = useQuery({
    queryKey: ["content-pages", slug],
    enabled: !!slug,
    queryFn: () => getContentPages(slug).catch(() => [] as ContentPage[]),
  });

  // Seed the URL once pages arrive (or fall back to the run's home URL).
  useEffect(() => {
    if (url) return;
    const initial = pages[0]?.url || run?.url || "";
    if (initial) setUrl(initial);
  }, [pages, run?.url, url]);

  const loadPage = useCallback(
    async (target: string) => {
      if (!slug || !target) return;
      setPageLoading(true);
      setPageError(null);
      setError(null);
      setNotice(null);
      setSelectedElement(null);
      try {
        const data = await getContentPageFields(slug, target);
        setPageFields(data);
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail;
        setPageError(detail || "Couldn't load this page.");
        setPageFields(null);
      } finally {
        setPageLoading(false);
      }
    },
    [slug],
  );

  async function handleRewriteElement(instruction: string): Promise<string> {
    if (!selectedElement) return "";
    setRewritingElement(true);
    setError(null);
    try {
      return await rewriteElement(slug, selectedElement.tag, selectedElement.text, instruction);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Couldn't rewrite this element.");
      return "";
    } finally {
      setRewritingElement(false);
    }
  }

  async function handleApplyElement(newText: string) {
    if (!selectedElement || !url) return;
    setApplyingElement(true);
    setError(null);
    setNotice(null);
    try {
      const result = await applyElementEdit(slug, url, selectedElement.text, newText);
      const ok = (result.saved?.length || 0) > 0 && (result.failed?.length || 0) === 0;
      if (ok) {
        setNotice("Applied to live site. Reloading preview…");
        // Re-fetch so the screenshot reflects the change.
        const fresh = await getContentPageFields(slug, url);
        setPageFields(fresh);
        setSelectedElement(null);
      } else {
        const msg = result.failed?.[0]?.message || "Plugin returned an error.";
        setError(`Couldn't apply edit: ${msg}`);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 503) {
        setError(detail || "Connect WordPress or Shopify to apply this change.");
      } else {
        setError(detail || "Couldn't apply this edit.");
      }
    } finally {
      setApplyingElement(false);
    }
  }

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
      <div data-tour-card="content-chrome">
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
      </div>

      {(error || notice || (!pluginConnected && pageFields)) && (
        <div className="flex flex-col gap-1 border-b border-border bg-muted/15 px-3 py-2">
          {!pluginConnected && pageFields ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <AlertCircle className="size-3.5" />
              <span>
                No plugin connected. Click any element to edit, but applying needs WordPress or
                Shopify.
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                Connect
              </span>
            </div>
          ) : null}
          {error ? <p className="text-[11px] text-rose-600 dark:text-rose-400">{error}</p> : null}
          {notice ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{notice}</p>
          ) : null}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div
          className={`flex-1 min-w-0 ${selectedElement ? "border-r border-border" : ""}`}
          data-tour-card="content-iframe"
        >
          <PageIframe
            previewImage={pageFields?.preview_image || ""}
            previewElements={pageFields?.preview_elements || []}
            viewportWidth={pageFields?.preview_viewport_width || 1440}
            isLoading={pageLoading}
            emptyMessage={pageError || undefined}
            selectedElementId={selectedElement?.id ?? null}
            onSelectElement={setSelectedElement}
          />
        </div>

        {selectedElement ? (
          <div className="w-[360px] min-w-[300px] shrink-0">
            <ElementEditor
              element={selectedElement}
              applyDisabled={!pluginConnected}
              applyDisabledHint={applyDisabledHint}
              isRewriting={rewritingElement}
              isApplying={applyingElement}
              onClose={() => setSelectedElement(null)}
              onRewrite={handleRewriteElement}
              onApply={handleApplyElement}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
