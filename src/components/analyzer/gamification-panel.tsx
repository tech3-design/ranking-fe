"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/lib/stores/gamification-store";
import { getStatusColor, getStatusLabel, getStatusBadgeClass, getLevelBadgeColor } from "@/lib/api/gamification";
import type { Recommendation } from "@/lib/api/analyzer";

interface GamificationPanelProps {
  email: string;
  recommendations: Recommendation[];
  runId: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  medium: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const POINTS_MAP: Record<string, number> = {
  critical: 50,
  high: 30,
  medium: 20,
  low: 10,
};

function getPointsForRecommendation(rec: Recommendation): number {
  return POINTS_MAP[rec.priority] || 10;
}

function extractCodeBlocks(text: string): { parts: Array<{ type: "text" | "code"; content: string }> } {
  const lines = text.split("\n");
  const parts: Array<{ type: "text" | "code"; content: string }> = [];
  let currentCode: string[] = [];
  let currentText: string[] = [];

  for (const line of lines) {
    const isCode =
      line.trim().startsWith("<") ||
      line.trim().startsWith("{") ||
      line.trim().startsWith("}") ||
      line.trim().startsWith('"@') ||
      line.trim().startsWith("User-agent:") ||
      line.trim().startsWith("Allow:") ||
      line.trim().startsWith("Disallow:");

    if (isCode) {
      if (currentText.length) {
        parts.push({ type: "text", content: currentText.join("\n") });
        currentText = [];
      }
      currentCode.push(line);
    } else {
      if (currentCode.length) {
        parts.push({ type: "code", content: currentCode.join("\n") });
        currentCode = [];
      }
      currentText.push(line);
    }
  }
  if (currentCode.length) parts.push({ type: "code", content: currentCode.join("\n") });
  if (currentText.length) parts.push({ type: "text", content: currentText.join("\n") });

  return { parts };
}

export function GamificationPanel({ email, recommendations, runId }: GamificationPanelProps) {
  const { 
    gamification, 
    actions, 
    stats, 
    isLoading,
    fetchGamification,
    fetchStats,
    fetchActions,
    addActionFromRecommendation,
    updateActionStatus,
    initializeActionsFromRecommendations
  } = useGamificationStore();
   
  const [activeTab, setActiveTab] = useState<"actions" | "achievements">("actions");
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  // Auto-initialize actions from recommendations when component loads
  useEffect(() => {
    if (email && recommendations.length > 0) {
      fetchGamification(email);
      fetchStats(email, runId);
      fetchActions(email);
    }
  }, [email, recommendations.length, fetchGamification, fetchStats, fetchActions]);

  // Filter actions to show only those for current run (by analysis_run, not by recommendation IDs)
  // This ensures each website shows only its own actions
  // Handle both number and string comparison since API might return either
  const filteredActions = actions.filter(a => {
    if (!a.analysis_run) return false;
    return Number(a.analysis_run) === Number(runId);
  });

  // Initialize actions from recommendations if no actions exist
  const handleInitializeActions = async () => {
    if (isInitializing || !email || recommendations.length === 0) return;
    
    setIsInitializing(true);
    try {
      await initializeActionsFromRecommendations(email, recommendations, runId);
      await fetchActions(email);
      await fetchGamification(email);
      await fetchStats(email);
    } catch (error) {
      console.error("Failed to initialize actions:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStartAction = async (actionId: number) => {
    try {
      await updateActionStatus(actionId, "in_progress");
      await fetchGamification(email);
      await fetchStats(email, runId);
    } catch (error) {
      console.error("Failed to start action:", error);
    }
  };

  const handleCompleteAction = async (actionId: number) => {
    try {
      const result = await updateActionStatus(actionId, "completed");
      await fetchGamification(email);
      await fetchStats(email, runId);
      await fetchActions(email);
      
      if (result?.new_achievements?.length) {
        setNewAchievements(result.new_achievements);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
    } catch (error) {
      console.error("Failed to complete action:", error);
    }
  };

  const handleVerifyAction = async (actionId: number) => {
    try {
      await updateActionStatus(actionId, "verified");
      await fetchGamification(email);
      await fetchStats(email, runId);
      await fetchActions(email);
    } catch (error) {
      console.error("Failed to verify action:", error);
    }
  };

  // Merge recommendations with actions - show all recommendations as actions
  const pendingActions = filteredActions.filter(a => a.status === "pending");
  const inProgressActions = filteredActions.filter(a => a.status === "in_progress");
  const completedActions = filteredActions.filter(a => a.status === "completed" || a.status === "verified");
  const verifiedActions = filteredActions.filter(a => a.status === "verified");

  // Create a map of existing action IDs from recommendations (for filtered actions)
  const existingRecIds = new Set(filteredActions.map(a => a.recommendation));
  
  // Get recommendations that haven't been added as actions yet
  const untrackedRecommendations = recommendations.filter(r => !existingRecIds.has(r.id));

  // Show empty state if no actions and no recommendations
  const showEmptyState = filteredActions.length === 0 && recommendations.length === 0;
  const showInitializePrompt = filteredActions.length === 0 && recommendations.length > 0;

  return (
    <>
      <Card className="backdrop-blur-xl bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>Action Tracker</span>
              {(pendingActions.length + inProgressActions.length > 0) && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingActions.length + inProgressActions.length}</span>
              )}
            </CardTitle>

          </div>
          
          {/* Level Progress Bar */}
          {gamification && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className={`px-2 py-0.5 rounded-full ${getLevelBadgeColor(gamification.level)}`}>
                  Lvl {gamification.level} - {gamification.level_name}
                </span>
                <span>{gamification.current_level_points} / {gamification.points_to_next_level} pts to next</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.level_progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2 mb-4">
            <Button
              variant={activeTab === "actions" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("actions")}
            >
              Actions ({filteredActions.length || recommendations.length})
            </Button>
            <Button
              variant={activeTab === "achievements" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("achievements")}
            >
              Achievements 🏆
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "actions" && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Show Initialize Button if no actions yet */}
                {showInitializePrompt && (
                  <div className="text-center py-8 space-y-4">
                    <div className="text-4xl mb-2">🎯</div>
                    <h3 className="text-lg font-semibold">Start Tracking Your Actions</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      You have {recommendations.length} recommendations from your analysis. 
                      Add them to your tracker to earn points and level up!
                    </p>
                    <Button 
                      onClick={handleInitializeActions}
                      disabled={isInitializing}
                      className="gap-2"
                    >
                      {isInitializing ? "Adding Actions..." : `Add All ${recommendations.length} Actions`}
                    </Button>
                  </div>
                )}

                {showEmptyState && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-muted-foreground">No recommendations to track yet.</p>
                    <p className="text-sm text-muted-foreground">Run an analysis to get started!</p>
                  </div>
                )}

                {/* Stats Summary */}
                {filteredActions.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-teal-500">{pendingActions.length}</p>
                      <p className="text-xs text-muted-foreground">To Do</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-yellow-500">{inProgressActions.length}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-green-500">{completedActions.length}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-cyan-500">{verifiedActions.length}</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {filteredActions.length > 0 && (
                  <div className="space-y-3">
                    {/* In Progress */}
                    {inProgressActions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-yellow-500 uppercase tracking-wide mb-2">
                          In Progress ({inProgressActions.length})
                        </h4>
                        <div className="space-y-2">
                          {inProgressActions.map(action => (
                            <ActionItem
                              key={action.id}
                              action={action}
                              recommendation={recommendations.find(r => r.id === action.recommendation) as Recommendation | undefined}
                              isExpanded={expandedAction === action.id}
                              onToggle={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                              onStart={() => handleStartAction(action.id)}
                              onComplete={() => handleCompleteAction(action.id)}
                              onVerify={() => handleVerifyAction(action.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending */}
                    {pendingActions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-2">
                          To Do ({pendingActions.length})
                        </h4>
                        <div className="space-y-2">
                          {pendingActions.map(action => (
                            <ActionItem
                              key={action.id}
                              action={action}
                              recommendation={recommendations.find(r => r.id === action.recommendation) as Recommendation | undefined}
                              isExpanded={expandedAction === action.id}
                              onToggle={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                              onStart={() => handleStartAction(action.id)}
                              onComplete={() => handleCompleteAction(action.id)}
                              onVerify={() => handleVerifyAction(action.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed/Verified */}
                    {completedActions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-2">
                          Completed ({completedActions.length})
                        </h4>
                        <div className="space-y-2">
                          {completedActions.map(action => (
                            <ActionItem
                              key={action.id}
                              action={action}
                              recommendation={recommendations.find(r => r.id === action.recommendation) as Recommendation | undefined}
                              isExpanded={expandedAction === action.id}
                              onToggle={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                              onStart={() => handleStartAction(action.id)}
                              onComplete={() => handleCompleteAction(action.id)}
                              onVerify={() => handleVerifyAction(action.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "achievements" && stats && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {ACHIEVEMENTS.map(ach => {
                    const earned = (gamification?.achievements || []).includes(ach.id) || stats.completed_actions >= ach.required;
                    return (
                      <div 
                        key={ach.id}
                        className={`p-3 rounded-lg border ${earned ? "bg-primary/10 border-primary" : "bg-muted/30 border-border opacity-60"}`}
                      >
                        <div className="text-2xl mb-1">{earned ? ach.icon : "🔒"}</div>
                        <h4 className="text-sm font-semibold">{ach.name}</h4>
                        <p className="text-xs text-muted-foreground">{ach.description}</p>
                        {ach.required > 0 && (
                          <p className="text-xs mt-1">
                            {stats.completed_actions || 0} / {ach.required} actions
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

            {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && typeof document !== "undefined"
          ? createPortal(
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/50"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.5, y: 50 }}
                  className="absolute left-1/2 top-1/2 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-8 text-center"
                >
                  <div className="text-4xl mb-4 font-bold">LVL+</div>
                  <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
                  <p className="text-muted-foreground mb-4">
                    You've earned enough points to level up!
                  </p>
                  {newAchievements.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold">New Achievements Unlocked:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {newAchievements.map(ach => (
                          <span key={ach} className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                            {ach}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>,
              document.body,
            )
          : null}
      </AnimatePresence>
    </>
  );
}

function ActionItem({ 
  action, 
  recommendation,
  isExpanded, 
  onToggle,
  onStart,
  onComplete,
  onVerify 
}: { 
  action: any;
  recommendation?: Recommendation;
  isExpanded: boolean;
  onToggle: () => void;
  onStart: () => void;
  onComplete: () => void;
  onVerify: () => void;
}) {
  const priorityColor = recommendation ? PRIORITY_COLORS[recommendation.priority] : "bg-muted";
  const points = recommendation ? getPointsForRecommendation(recommendation) : 10;

  return (
    <div 
      className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${getStatusColor(action.status)}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusBadgeClass(action.status)}`}>
              {getStatusLabel(action.status)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground">
              +{action.points_earned || points} pts
            </span>
            {recommendation && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityColor}`}>
                {recommendation.priority.toUpperCase()}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium mt-1 truncate">
            {recommendation?.title || action.title || "Action"}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {recommendation?.description || action.description || "Complete this task to earn points"}
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          {action.status === "pending" && (
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onStart(); }}>
              Start
            </Button>
          )}
          {action.status === "in_progress" && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); onComplete(); }}>
              Done
            </Button>
          )}
          {action.status === "completed" && (
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onVerify(); }}>
              Verify
            </Button>
          )}
          {action.status === "verified" && (
            <span className="text-green-500 text-xs">✓ Verified</span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && recommendation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 pt-3 border-t border-current/10"
          >
            <div className="text-xs space-y-2">
              <p className="font-semibold">Action Steps:</p>
              <div className="whitespace-pre-wrap text-muted-foreground max-h-40 overflow-y-auto">
                {recommendation.action}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ACHIEVEMENTS = [
  { id: "first_action", name: "First Step", description: "Complete your first action", icon: "🌟", required: 1 },
  { id: "five_actions", name: "Getting Started", description: "Complete 5 actions", icon: "🚀", required: 5 },
  { id: "ten_actions", name: "On Fire", description: "Complete 10 actions", icon: "🔥", required: 10 },
  { id: "twenty_actions", name: "SEO Master", description: "Complete 20 actions", icon: "👑", required: 20 },
  { id: "fifty_actions", name: "Legend", description: "Complete 50 actions", icon: "🏆", required: 50 },
  { id: "streak_3", name: "Consistent", description: "3 day streak", icon: "📈", required: 0 },
  { id: "streak_7", name: "Week Warrior", description: "7 day streak", icon: "💪", required: 0 },
  { id: "streak_30", name: "Monthly Master", description: "30 day streak", icon: "🎯", required: 0 },
];

