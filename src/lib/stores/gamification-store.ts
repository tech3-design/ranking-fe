import { create } from "zustand";
import type { 
  UserGamification, 
  UserAction, 
  ActionStats,
  Achievement 
} from "@/lib/api/gamification";
import { 
  getUserGamification, 
  getActionStats, 
  getUserActions,
  createQuickAction,
  updateUserAction,
  bulkCreateActions 
} from "@/lib/api/gamification";
import type { Recommendation } from "@/lib/api/analyzer";

interface GamificationState {
  gamification: UserGamification | null;
  actions: UserAction[];
  stats: ActionStats | null;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGamification: (email: string) => Promise<void>;
  fetchStats: (email: string, runId?: number) => Promise<void>;
  fetchActions: (email: string, status?: string) => Promise<void>;
  addActionFromRecommendation: (email: string, recommendationId: number) => Promise<UserAction>;
  updateActionStatus: (actionId: number, status: string, scoreAfter?: number) => Promise<{ new_achievements?: string[] }>;
  initializeActionsFromRecommendations: (email: string, recommendations: Recommendation[], runId: number) => Promise<void>;
  clearError: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  gamification: null,
  actions: [],
  stats: null,
  achievements: [],
  isLoading: false,
  error: null,

  fetchGamification: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const gamification = await getUserGamification(email);
      set({ gamification, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch gamification", 
        isLoading: false 
      });
    }
  },

  fetchStats: async (email: string, runId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await getActionStats(email, runId);
      set({ stats, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch stats", 
        isLoading: false 
      });
    }
  },

  fetchActions: async (email: string, status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const actions = await getUserActions(email, status);
      set({ actions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch actions", 
        isLoading: false 
      });
    }
  },

  addActionFromRecommendation: async (email: string, recommendationId: number) => {
    set({ isLoading: true, error: null });
    try {
      const action = await createQuickAction(email, recommendationId);
      // Refresh actions after adding
      const actions = await getUserActions(email);
      set({ actions, isLoading: false });
      return action;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to create action", 
        isLoading: false 
      });
      throw error;
    }
  },

  updateActionStatus: async (actionId: number, status: string, scoreAfter?: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateUserAction(actionId, { 
        status: status as "pending" | "in_progress" | "completed" | "verified",
        score_after: scoreAfter 
      });
      
      // Update gamification with new data
      set({ 
        gamification: result.gamification,
        isLoading: false 
      });
      
      // Refresh actions
      const email = result.gamification.user_email;
      const actions = await getUserActions(email);
      set({ actions });
      
      return { new_achievements: result.new_achievements };
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to update action", 
        isLoading: false 
      });
      throw error;
    }
  },

  initializeActionsFromRecommendations: async (email: string, recommendations: Recommendation[], runId: number) => {
    set({ isLoading: true, error: null });
    try {
      const recsForApi = recommendations.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        action: r.action,
        priority: r.priority,
        url: (r as any).url || "",
        analysis_run_id: runId
      }));
      const actions = await bulkCreateActions(email, recsForApi);
      set({ actions, isLoading: false });
      
      const { fetchActions, fetchGamification, fetchStats } = get();
      await fetchActions(email);
      await fetchGamification(email);
      await fetchStats(email, runId);
      await fetchActions(email);
      await fetchGamification(email);
      await fetchStats(email, runId);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to initialize actions", 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
