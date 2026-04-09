"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Eye, ShieldCheck } from "lucide-react";
import type { FixPreview } from "@/lib/api/analyzer";

/** Fix types where preview contains code/tags, not renderable HTML */
function isCodePreview(fixType: string): boolean {
  return ["schema", "meta", "ai_meta", "llms", "robots", "canonical", "viewport", "noindex"].includes(fixType);
}

interface FixPreviewModalProps {
  preview: FixPreview;
  onApprove: () => Promise<void>;
  onCancel: () => void;
}

export function FixPreviewModal({ preview, onApprove, onCancel }: FixPreviewModalProps) {
  const [applying, setApplying] = useState(false);
  const [tab, setTab] = useState<"before" | "after">("after");
  const [copiedFull, setCopiedFull] = useState(false);

  async function copyFullFile() {
    const text = preview.full_content || preview.preview || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function handleApprove() {
    setApplying(true);
    try {
      await onApprove();
    } finally {
      setApplying(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
      >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Preview Fix</h3>
                <p className="text-xs text-muted-foreground">{preview.recommendation_title}</p>
              </div>
            </div>
            <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 px-6 pt-3 shrink-0">
            <button
              onClick={() => setTab("before")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === "before" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setTab("after")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === "after" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              After (Preview)
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
              {tab === "before" ? (
                preview.original ? (
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: preview.original }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">No existing content</p>
                )
              ) : isCodePreview(preview.fix_type) ? (
                <pre className="whitespace-pre-wrap font-mono text-xs text-foreground bg-muted/50 rounded-lg p-4 overflow-x-auto">{preview.preview}</pre>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: preview.preview }}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 px-6 py-4 border-t border-border shrink-0 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {preview.fix_type === "schema" ? "JSON-LD will be injected into page" :
                 preview.fix_type === "llms" ? (
                   <>
                     llms.txt is sent to your connected app/plugin. On Shopify, /llms.txt often does not exist at the storefront root
                     until App Proxy serves it (try /apps/signalor/llms.txt if configured). Use Copy full file below if you need the raw text.
                   </>
                 ) :
                 preview.fix_type === "robots" ? "robots.txt is sent to your app/plugin; verify the live URL your theme or proxy exposes." :
                 preview.fix_type === "meta" ? "SEO title and description will be updated" :
                 preview.fix_type === "ai_meta" ? "AI crawler meta tags will be injected" :
                 `Content will be updated (${preview.preview.length} chars)`}
              </p>
              {(preview.fix_type === "llms" || preview.fix_type === "robots") && (preview.full_content || preview.preview) ? (
                <button
                  type="button"
                  onClick={copyFullFile}
                  className="text-[10px] font-medium text-primary hover:underline"
                >
                  {copiedFull ? "Copied" : "Copy full file"}
                </button>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={onCancel}
                disabled={applying}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:bg-accent transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={applying}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition disabled:opacity-50"
              >
                {applying ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...</>
                ) : (
                  <><ShieldCheck className="w-3.5 h-3.5" /> Apply Fix</>
                )}
              </button>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
}
