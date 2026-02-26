import { apiClient } from "./client";

// ============ Types ============

export interface Achievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

export interface UserGamification {
  user_email: string;
  total_points: number;
  points_this_week: number;
  points_this_month: number;
  level: number;
  level_name: string;
  current_level_points: number;
  points_to_next_level: number;
  level_progress: number;
  current_streak: number;
  longest_streak: number;
  total_actions_completed: number;
  total_actions_verified: number;
  total_score_improvement: number;
  achievements: string[];
  achievements_detail: Achievement[];
  created_at: string;
  updated_at: string;
}

export interface UserAction {
  id: number;
  action_type: string;
  title: string;
  description: string;
  action: string;  // The action details from recommendation
  points_value: number;
  status: "pending" | "in_progress" | "completed" | "verified";
  started_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  score_before: number | null;
  score_after: number | null;
  score_improvement: number | null;
  notes: string;
  created_at: string;
  analysis_run: number | null;
  recommendation: number | null;
}

export interface ActionTemplate {
  action_type: string;
  title: string;
  description: string;
  points: number;
  category: string;
}

export interface ActionStats {
  total_actions: number;
  pending_actions: number;
  in_progress_actions: number;
  completed_actions: number;
  verified_actions: number;
  total_points: number;
  points_this_week: number;
  current_streak: number;
  level: number;
  level_name: string;
  level_progress: number;
  recent_achievements: Achievement[];
}

export interface CreateActionPayload {
  action_type: string;
  title: string;
  description?: string;
  notes?: string;
  recommendation_id?: number;
  analysis_run_id?: number;
  score_before?: number;
}

export interface UpdateActionPayload {
  status?: "pending" | "in_progress" | "completed" | "verified";
  notes?: string;
  score_after?: number;
}

// ============ API Functions ============

export async function getUserGamification(email: string): Promise<UserGamification> {
  const { data } = await apiClient.get<UserGamification>(
    "/api/analyzer/gamification/",
    { params: { email } }
  );
  return data;
}

export async function getActionStats(email: string, runId?: number): Promise<ActionStats> {
  const { data } = await apiClient.get<ActionStats>(
    "/api/analyzer/gamification/stats/",
    { params: { email, run_id: runId } }
  );
  return data;
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await apiClient.get<Achievement[]>("/api/analyzer/achievements/");
  return data;
}

export async function getActionTemplates(): Promise<ActionTemplate[]> {
  const { data } = await apiClient.get<ActionTemplate[]>("/api/analyzer/action-templates/");
  return data;
}

export async function getUserActions(
  email: string,
  status?: string
): Promise<UserAction[]> {
  const { data } = await apiClient.get<UserAction[]>(
    "/api/analyzer/actions/",
    { params: { email, status } }
  );
  return data;
}

export async function createUserAction(
  email: string,
  payload: CreateActionPayload
): Promise<UserAction> {
  const { data } = await apiClient.post<UserAction>(
    "/api/analyzer/actions/create/",
    { ...payload, email }
  );
  return data;
}

export async function updateUserAction(
  actionId: number,
  payload: UpdateActionPayload
): Promise<{ action: UserAction; gamification: UserGamification; new_achievements: string[] }> {
  const { data } = await apiClient.post(
    `/api/analyzer/actions/${actionId}/`,
    payload
  );
  return data;
}

export async function createQuickAction(
  email: string,
  recommendationId: number
): Promise<UserAction> {
  const { data } = await apiClient.post<UserAction>(
    "/api/analyzer/actions/quick/",
    { email, recommendation_id: recommendationId }
  );
  return data;
}

export async function bulkCreateActions(
  email: string,
  recommendations: Array<{id: number; title: string; description: string; action: string; priority: string; url?: string; analysis_run_id?: number}>
): Promise<UserAction[]> {
  const { data } = await apiClient.post<UserAction[]>(
    "/api/analyzer/actions/bulk-create/",
    { email, recommendations }
  );
  return data;
}

// ============ Helper Functions ============

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    case "in_progress":
      return "bg-teal-500/10 text-teal-500 border-teal-500/20";
    case "completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "verified":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "verified":
      return "Verified";
    default:
      return status;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-gray-500/20 text-gray-500";
    case "in_progress":
      return "bg-teal-500/20 text-teal-500";
    case "completed":
      return "bg-green-500/20 text-green-500";
    case "verified":
      return "bg-yellow-500/20 text-yellow-500";
    default:
      return "bg-gray-500/20 text-gray-500";
  }
}

export function getLevelBadgeColor(level: number): string {
  if (level >= 7) return "bg-cyan-500 text-white";
  if (level >= 5) return "bg-yellow-500 text-black";
  if (level >= 3) return "bg-green-500 text-white";
  if (level >= 2) return "bg-teal-500 text-white";
  return "bg-gray-500 text-white";
}
