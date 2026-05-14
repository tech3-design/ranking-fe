"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
} from "@/lib/api/organizations";
import { useOrgStore } from "@/lib/stores/org-store";
import {
  Loader2,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  ShieldX,
  Clock,
  LogOut,
  Globe,
  Check,
  X,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { terminateAccount, cancelTermination, deleteAccount } from "@/lib/api/payments";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? "";
  const userName = session?.user?.name || email.split("@")[0] || "User";
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const { setOrganizations } = useOrgStore();

  const [organizations, setLocalOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateStep, setTerminateStep] = useState<"idle" | "done">("idle");
  const [terminating, setTerminating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<number | null>(null);
  const [deleteOrgName, setDeleteOrgName] = useState("");
  const [deleteOrgConfirmText, setDeleteOrgConfirmText] = useState("");
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadOrgs = useCallback(async () => {
    if (!email) return;
    try {
      setLoading(true);
      const data = await getOrganizations(email);
      setLocalOrgs(data);
      setOrganizations(data);
    } catch {
      setError("Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [email, setOrganizations]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  async function handleSave(id: number) {
    if (!editName.trim()) return;
    setSavingId(id);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateOrganization(id, { name: editName.trim(), url: editUrl.trim() });
      const next = organizations.map((o) => (o.id === id ? updated : o));
      setLocalOrgs(next);
      setOrganizations(next);
      setEditingId(null);
      setNotice("Project updated.");
    } catch {
      setError("Failed to update.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);
    setNotice(null);
    try {
      await deleteOrganization(id);
      const next = organizations.filter((o) => o.id !== id);
      setLocalOrgs(next);
      setOrganizations(next);
      if (editingId === id) setEditingId(null);
      setNotice("Project deleted.");
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTerminate() {
    if (!email) return;
    setTerminating(true);
    setError(null);
    try {
      await terminateAccount(email);
      setTerminateStep("done");
      setShowTerminateDialog(false);
      setNotice("Account scheduled for deactivation in 24 hours.");
    } catch {
      setError("Failed to terminate account.");
    } finally {
      setTerminating(false);
    }
  }

  async function handleCancelTermination() {
    if (!email) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelTermination(email);
      setTerminateStep("idle");
      setNotice("Termination cancelled. Your account is active.");
    } catch {
      setError("Failed to cancel termination.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleDeleteAccount() {
    if (!email || deleteConfirmText !== "delete my account") return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount(email, deleteConfirmText);
      await signOut();
      router.push(routes.signIn);
    } catch {
      setError("Failed to delete account.");
      setDeleting(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
      router.push(routes.signIn);
    } catch {
      setError("Failed to sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and projects.
        </p>
      </div>

      {/* ── Toasts ── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      )}
      {notice && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          {notice}
        </div>
      )}

      {/* ── Account card ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-r from-primary/6 via-primary/3 to-transparent px-6 py-4 border-b border-border">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Account
          </p>
        </div>
        <div className="flex items-center gap-5 px-6 py-5">
          <div className="relative shrink-0">
            <UserAvatar src={userImage} initials={userInitials} size={72} />
            {userImage && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-white shadow-sm">
                <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"
                    fill="#4285f4"
                  />
                </svg>
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold tracking-tight text-foreground">{userName}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
            {userImage && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Photo from Google
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Projects card ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-transparent to-transparent px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Projects
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Add, edit, or remove your projects.
            </p>
          </div>
          <button
            onClick={() => router.push("/onboarding/company-info")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New Project
          </button>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="space-y-2 p-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3.5"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex gap-1.5">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Globe className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground">No projects yet</p>
              <p className="text-[13px] text-muted-foreground">
                Click &ldquo;New Project&rdquo; to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 p-1">
              {organizations.map((org) => {
                const isEditing = editingId === org.id;
                return (
                  <div
                    key={org.id}
                    className="rounded-lg border border-border/60 bg-background transition-colors hover:bg-muted/20"
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-2.5 p-3.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Name
                            </label>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              URL
                            </label>
                            <input
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground shadow-sm transition hover:bg-muted"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave(org.id)}
                            disabled={savingId === org.id}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                          >
                            {savingId === org.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                            )}
                            {savingId === org.id ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                          <Globe className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-foreground">
                            {org.name}
                          </p>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {org.url || "No URL set"}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => {
                              setEditingId(org.id);
                              setEditName(org.name);
                              setEditUrl(org.url ?? "");
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteOrgId(org.id);
                              setDeleteOrgName(org.name);
                              setDeleteOrgConfirmText("");
                            }}
                            disabled={deletingId === org.id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/20 bg-card text-destructive shadow-sm transition hover:bg-destructive/8 disabled:opacity-40"
                            title="Delete"
                          >
                            {deletingId === org.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Account actions ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Account Actions
          </p>
        </div>

        <div className="divide-y divide-border">
          {/* Sign out */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Sign out</p>
              <p className="text-[12px] text-muted-foreground">End your session on this device.</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="shrink-0 rounded-lg border border-border bg-card px-4 py-2 text-[12px] font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>

          {/* Pause Account */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Clock className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Pause Account</p>
              <p className="text-[12px] text-muted-foreground">
                Temporarily pause. Resume anytime from this page.
              </p>
            </div>
            {terminateStep === "idle" ? (
              <button
                onClick={() => setShowTerminateDialog(true)}
                className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-[12px] font-semibold text-amber-600 shadow-sm transition hover:bg-amber-100"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleCancelTermination}
                disabled={cancelling}
                className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-600 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
              >
                {cancelling ? "Resuming…" : "Resume"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="overflow-hidden rounded-xl border border-destructive/20 bg-destructive/[0.02] shadow-sm">
        <div className="flex items-center gap-2 border-b border-destructive/15 px-6 py-4">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" strokeWidth={2} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-destructive">
            Danger Zone
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/8 text-destructive">
              <ShieldX className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Delete Account</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Permanently deletes all data, projects, and analysis runs for{" "}
                <span className="font-medium text-foreground">{email}</span>. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setDeleteStep(1)}
              className="shrink-0 rounded-lg bg-destructive px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* ════ MODALS ════ */}

      {/* Delete Organization */}
      {deleteOrgId !== null && (
        <Modal
          onClose={() => {
            setDeleteOrgId(null);
            setDeleteOrgName("");
            setDeleteOrgConfirmText("");
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Delete project</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              This removes all analysis runs and data for this project. Type{" "}
              <strong className="font-semibold text-foreground">
                &ldquo;{deleteOrgName}&rdquo;
              </strong>{" "}
              to confirm.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Project name
            </label>
            <input
              type="text"
              value={deleteOrgConfirmText}
              onChange={(e) => setDeleteOrgConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={deleteOrgName}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                if (deleteOrgId === null || deleteOrgConfirmText.trim() !== deleteOrgName.trim())
                  return;
                handleDelete(deleteOrgId);
                setDeleteOrgId(null);
                setDeleteOrgName("");
                setDeleteOrgConfirmText("");
              }}
              disabled={
                deletingId === deleteOrgId || deleteOrgConfirmText.trim() !== deleteOrgName.trim()
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-40"
            >
              {deletingId === deleteOrgId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              )}
              {deletingId === deleteOrgId ? "Deleting…" : "Delete project"}
            </button>
            <button
              onClick={() => {
                setDeleteOrgId(null);
                setDeleteOrgName("");
                setDeleteOrgConfirmText("");
              }}
              className="flex-1 rounded-xl border border-border bg-card py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Pause Account */}
      {showTerminateDialog && (
        <Modal onClose={() => setShowTerminateDialog(false)}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
            <Clock className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Pause Account</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Your account will be paused and scheduled analyses will be disabled. You can{" "}
              <span className="font-semibold text-foreground">resume anytime</span> from the Profile
              page.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[12px] leading-relaxed text-amber-700">
              While paused, integrations and auto-reanalysis will be suspended until you resume.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={handleTerminate}
              disabled={terminating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            >
              {terminating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" strokeWidth={1.75} />
              )}
              {terminating ? "Pausing…" : "Pause Account"}
            </button>
            <button
              onClick={() => setShowTerminateDialog(false)}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Account – Step 1 */}
      {deleteStep === 1 && (
        <Modal onClose={() => setDeleteStep(0)}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldX className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Delete account?</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              This will permanently remove all your data, projects, and analysis history. This
              action cannot be reversed.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setDeleteStep(2)}
              className="flex-1 rounded-xl bg-destructive py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Yes, continue
            </button>
            <button
              onClick={() => setDeleteStep(0)}
              className="flex-1 rounded-xl border border-border bg-card py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Account – Step 2 */}
      {deleteStep === 2 && (
        <Modal
          onClose={() => {
            setDeleteStep(0);
            setDeleteConfirmText("");
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldX className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Confirm deletion</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Type{" "}
              <span className="font-mono font-semibold text-foreground">delete my account</span>{" "}
              below to permanently delete everything associated with{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
            <p className="text-[12px] leading-relaxed text-destructive">
              All analysis runs, organizations, and subscription data will be permanently removed.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Confirmation
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete my account"
              autoFocus
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-mono text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-destructive/25"
            />
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== "delete my account"}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              )}
              {deleting ? "Deleting…" : "Delete Forever"}
            </button>
            <button
              onClick={() => {
                setDeleteStep(0);
                setDeleteConfirmText("");
              }}
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
