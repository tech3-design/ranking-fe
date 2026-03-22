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

    const promises = fixable.map(async (rec) => {
      try {
        const results = await applyAutoFix(slug, [rec.id], email, orgId);
        if (results[0]?.status === "success") {
          setFixedCount((prev) => prev + 1);
        }
      } catch {}
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    });

    await Promise.all(promises);
    setFixing(false);
  }

  if (total === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#3ecf8e]/20 bg-gradient-to-br from-[#3ecf8e]/15 to-[#2da06e]/5 p-4 md:p-6">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#3ecf8e]/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#3ecf8e]/20 p-2">
            <Wrench className="h-4 w-4 text-[#3ecf8e]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Auto-Fix</h3>
        </div>

        {allDone ? (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-[#3ecf8e]">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">All {total} fixes applied</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Re-analyze to see your improved score</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-2xl md:text-3xl font-bold text-white">{remaining}</p>
            <p className="text-xs text-slate-400">
              recommendation{remaining !== 1 ? "s" : ""} ready to apply
            </p>
            {fixedCount > 0 && (
              <p className="mt-1 text-[10px] text-[#3ecf8e]">{fixedCount} already fixed</p>
            )}

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Wrench className="h-3 w-3" /> AI-powered auto-fix
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <CheckCircle2 className="h-3 w-3" /> Pushes to your store
              </div>
            </div>

            <button
              onClick={handleFixAll}
              disabled={fixing}
              className="mt-4 flex w-full items-center justify-center gap-2 bg-[#3ecf8e] px-4 py-2.5 text-sm font-medium text-[#171717] transition-all hover:bg-[#35b87d] hover:shadow-[0_0_20px_rgba(62,207,142,0.35)] disabled:opacity-60"
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
