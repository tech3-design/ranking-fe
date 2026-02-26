import { create } from "zustand";
import type { AnalysisRunDetail, RunStatus } from "@/lib/api/analyzer";
import { getRunStatus, getRunDetail } from "@/lib/api/analyzer";

interface AnalyzerState {
  currentRunId: number | null;
  status: string;
  progress: number;
  results: AnalysisRunDetail | null;
  isPolling: boolean;
  error: string | null;

  setRunId: (id: number) => void;
  startPolling: () => void;
  stopPolling: () => void;
  setResults: (results: AnalysisRunDetail) => void;
  setError: (error: string) => void;
  reset: () => void;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useAnalyzerStore = create<AnalyzerState>((set, get) => ({
  currentRunId: null,
  status: "idle",
  progress: 0,
  results: null,
  isPolling: false,
  error: null,

  setRunId: (id: number) => set({ currentRunId: id, status: "pending", progress: 0 }),

  startPolling: () => {
    const { currentRunId } = get();
    if (!currentRunId) return;

    set({ isPolling: true });

    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
      const { currentRunId: runId } = get();
      if (!runId) {
        get().stopPolling();
        return;
      }

      try {
        const statusData: RunStatus = await getRunStatus(runId);
        set({
          status: statusData.status,
          progress: statusData.progress,
        });

        if (statusData.status === "complete" || statusData.status === "failed") {
          get().stopPolling();

          const detail = await getRunDetail(runId);
          set({ results: detail });
          if (statusData.status === "failed") {
            set({ error: detail.error_message || "Analysis failed. Please try again." });
          }
        }
      } catch {
        set({ error: "Failed to check analysis status." });
        get().stopPolling();
      }
    }, 2000);
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    set({ isPolling: false });
  },

  setResults: (results: AnalysisRunDetail) => set({ results }),

  setError: (error: string) => set({ error }),

  reset: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    set({
      currentRunId: null,
      status: "idle",
      progress: 0,
      results: null,
      isPolling: false,
      error: null,
    });
  },
}));
