"use client";

import { useState, useEffect, useRef } from "react";
import { Wrench, Loader2, CheckCircle2 } from "lucide-react";
import { applyAutoFix, getAutoFixStatus, type Recommendation } from "@/lib/api/analyzer";

interface FixCTACardProps {
  recommendations: Recommendation[];
  slug: string;
  email: string;
  orgId?: number;
}

export function FixCTACard({ recommendations, slug, email, orgId }: FixCTACardProps) {
  const [fixing, setFixing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [fixedCount, setFixedCount] = useState(0);
  const loadedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const fixable = recommendations.filter((r) => r.can_auto_fix);
  const total = fixable.length;

  useEffect(() => {
    if (!slug || loadedRef.current) return;
    loadedRef.current = true;
    getAutoFixStatus(slug)
      .then((results) => {
        setFixedCount(results.filter((r) => r.status === "success").length);
      })
      .catch(() => {});
  }, [slug]);

  const remaining = total - fixedCount;
  const allDone = total > 0 && remaining <= 0;

  async function handleFixAll() {
    if (!slug || !email || fixing || remaining <= 0) return;
    setFixing(true);
    setProgress({ done: 0, total: remaining });
    abortRef.current = new AbortController();

    // Run fixes sequentially — each one reads the updated content from the previous
    for (const rec of fixable) {
      if (abortRef.current.signal.aborted) break;
      try {
        const results = await applyAutoFix(slug, [rec.id], email, orgId);
        if (results[0]?.status === "success") {
          setFixedCount((prev) => prev + 1);
        }
      } catch {}
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }
    setFixing(false);
  }

  if (total === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/80/5 p-4 md:p-6">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/20 p-2">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Auto-Fix</h3>
        </div>

        {allDone ? (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">All {total} fixes applied</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Re-analyze to see your improved score</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-2xl md:text-3xl font-bold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground">
              recommendation{remaining !== 1 ? "s" : ""} ready to apply
            </p>
            {fixedCount > 0 && (
              <p className="mt-1 text-[10px] text-primary">{fixedCount} already fixed</p>
            )}

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Wrench className="h-3 w-3" /> AI-powered auto-fix
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" /> Pushes to your store
              </div>
            </div>

            <button
              onClick={handleFixAll}
              disabled={fixing}
              className="mt-4 flex w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
            >
              {fixing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Fixing {progress.done}/{progress.total}...
                </>
              ) : (
                <>Fix All &rarr;</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
