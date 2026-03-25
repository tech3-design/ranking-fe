"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { fireConfetti, fireSmallConfetti } from "@/lib/confetti";
import {
  getRunBySlug,
  getScoreHistory,
  getAutoFixStatus,
  type AnalysisRunDetail,
  type ScoreHistoryPoint,
  type AutoFixResult,
} from "@/lib/api/analyzer";

type FixResultMap = Record<number, { status: string; message: string }>;

interface RunContextValue {
  run: AnalysisRunDetail | null;
  scoreHistory: ScoreHistoryPoint[];
  fixResults: FixResultMap;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  setFixResult: (recId: number, result: { status: string; message: string }) => void;
}

const RunContext = createContext<RunContextValue>({
  run: null,
  scoreHistory: [],
  fixResults: {},
  loading: true,
  error: "",
  refetch: async () => {},
  setFixResult: () => {},
});

export function useRun() {
  return useContext(RunContext);
}

export function RunProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [run, setRun] = useState<AnalysisRunDetail | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [fixResults, setFixResults] = useState<FixResultMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const prevStatusRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setError("");
      const [detail, fixStatuses] = await Promise.all([
        getRunBySlug(slug),
        getAutoFixStatus(slug).catch(() => [] as AutoFixResult[]),
      ]);
      setRun(detail);

      // Build fix results map
      const fMap: FixResultMap = {};
      for (const r of fixStatuses) fMap[r.recommendation_id] = { status: r.status, message: r.message };
      setFixResults(fMap);

      if (detail.email) {
        const history = await getScoreHistory(detail.email).catch(() => []);
        setScoreHistory(history);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // Track status transitions for confetti
  useEffect(() => {
    if (!run) return;
    const prev = prevStatusRef.current;
    if (prev && prev !== "complete" && prev !== "failed" && run.status === "complete") {
      fireConfetti();
    }
    prevStatusRef.current = run.status;
  }, [run?.status]);

  // Poll while running
  useEffect(() => {
    if (!run || run.status === "complete" || run.status === "failed") return;
    prevStatusRef.current = run.status; // track so transition is detected
    const interval = setInterval(async () => {
      try {
        const updated = await getRunBySlug(slug);
        setRun(updated);
        if (updated.status === "complete" || updated.status === "failed") {
          clearInterval(interval);
          if (updated.email) {
            const history = await getScoreHistory(updated.email).catch(() => []);
            setScoreHistory(history);
          }
          // Fetch fix statuses on completion
          const fixStatuses = await getAutoFixStatus(slug).catch(() => [] as AutoFixResult[]);
          const fMap: FixResultMap = {};
          for (const r of fixStatuses) fMap[r.recommendation_id] = { status: r.status, message: r.message };
          setFixResults(fMap);
        }
      } catch { /* ignore */ }
    }, 2500);
    return () => clearInterval(interval);
  }, [run?.status, slug]);

  const setFixResult = useCallback((recId: number, result: { status: string; message: string }) => {
    setFixResults((prev) => ({ ...prev, [recId]: result }));
    if (result.status === "success") fireSmallConfetti();
  }, []);

  return (
    <RunContext.Provider value={{ run, scoreHistory, fixResults, loading, error, refetch: fetchData, setFixResult }}>
      {children}
    </RunContext.Provider>
  );
}
