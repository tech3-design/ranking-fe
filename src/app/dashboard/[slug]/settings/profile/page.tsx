"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import {
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
} from "@/lib/api/organizations";
import { useOrgStore } from "@/lib/stores/org-store";
import { Loader2, Pencil, Trash2, Plus, Camera, AlertTriangle, ShieldX, Clock, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { terminateAccount, cancelTermination, deleteAccount } from "@/lib/api/payments";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/config";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? "";
  const userName = session?.user?.name || email.split("@")[0] || "User";
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const { setOrganizations } = useOrgStore();

  const [organizations, setLocalOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Terminate / Delete state
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateStep, setTerminateStep] = useState<"idle" | "done">("idle");
  const [terminating, setTerminating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=closed, 1=are you sure, 2=type confirm
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

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  async function handleSave(id: number) {
    if (!editName.trim()) return;
    setSavingId(id); setError(null); setNotice(null);
    try {
      const updated = await updateOrganization(id, { name: editName.trim(), url: editUrl.trim() });
      const next = organizations.map((o) => (o.id === id ? updated : o));
      setLocalOrgs(next); setOrganizations(next);
      setEditingId(null);
      setNotice("Project updated.");
    } catch { setError("Failed to update."); }
    finally { setSavingId(null); }
  }

  async function handleDelete(id: number) {
    setDeletingId(id); setError(null); setNotice(null);
    try {
      await deleteOrganization(id);
      const next = organizations.filter((o) => o.id !== id);
      setLocalOrgs(next); setOrganizations(next);
      if (editingId === id) setEditingId(null);
      setNotice("Project deleted.");
    } catch { setError("Failed to delete."); }
    finally { setDeletingId(null); }
  }

  async function handleTerminate() {
    if (!email) return;
    setTerminating(true); setError(null);
    try {
      await terminateAccount(email);
      setTerminateStep("done");
      setShowTerminateDialog(false);
      setNotice("Account scheduled for deactivation in 24 hours.");
    } catch { setError("Failed to terminate account."); }
    finally { setTerminating(false); }
  }

  async function handleCancelTermination() {
    if (!email) return;
    setCancelling(true); setError(null);
    try {
      await cancelTermination(email);
      setTerminateStep("idle");
      setNotice("Termination cancelled. Your account is active.");
    } catch { setError("Failed to cancel termination."); }
    finally { setCancelling(false); }
  }

  async function handleDeleteAccount() {
    if (!email || deleteConfirmText !== "delete my account") return;
    setDeleting(true); setError(null);
    try {
      await deleteAccount(email, deleteConfirmText);
      await signOut();
      router.push(routes.signIn);
    } catch { setError("Failed to delete account."); setDeleting(false); }
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
    <div className="px-2 py-2 space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Profile</h2>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-accent-foreground">
          Manage your account and organizations.
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-3 text-[13px] font-semibold tracking-tight text-primary">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-sm border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-3 text-[13px] font-semibold tracking-tight text-[#16a34a]">
          {notice}
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
        <p className="mb-4 text-[14px] font-semibold tracking-tight text-neutral-900">Account</p>
        <div className="flex items-center gap-5">
          <div className="group relative">
            <UserAvatar src={userImage} initials={userInitials} size={64} />
            <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-neutral-900">{userName}</p>
            <p className="text-[12px] font-light leading-snug text-accent-foreground">{email}</p>
            {userImage && (
              <p className="mt-1 text-[10px] font-light text-accent-foreground">Photo from Google</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-sm border border-black/8 bg-white p-6 shadow-sm">
        <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Projects</p>
        <p className="mb-4 mt-1 text-[12px] font-light leading-snug text-accent-foreground">
          Add, edit, or remove your projects.
        </p>

        <button
          onClick={() => router.push("/onboarding/company-info")}
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold tracking-tight text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Add New Project
        </button>

        {loading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-sm border border-black/8 bg-neutral-50/80 px-4 py-3">
                <div className="space-y-1">
                  <Skeleton className="h-[14px] w-32 rounded" />
                  <Skeleton className="h-[12px] w-44 rounded" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-8 w-8 rounded-sm" />
                  <Skeleton className="h-8 w-8 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <p className="py-6 text-center text-[12px] font-light text-accent-foreground">No projects yet.</p>
        ) : (
          <div className="space-y-2">
            {organizations.map((org) => {
              const isEditing = editingId === org.id;
              return (
                <div key={org.id} className="rounded-sm border border-black/8 bg-neutral-50/80 px-4 py-3">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-sm border border-black/8 bg-white px-3 py-1.5 text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="flex-1 rounded-sm border border-black/8 bg-white px-3 py-1.5 text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={() => handleSave(org.id)}
                        disabled={savingId === org.id}
                        className="rounded-sm bg-primary px-3 py-1.5 text-[12px] font-semibold tracking-tight text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                      >
                        {savingId === org.id ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-sm border border-black/8 bg-white px-3 py-1.5 text-[12px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold tracking-tight text-neutral-900">{org.name}</p>
                        <p className="text-[12px] font-light leading-snug text-accent-foreground">{org.url || "No URL"}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setEditingId(org.id); setEditName(org.name); setEditUrl(org.url ?? ""); }}
                          className="flex h-8 w-8 items-center justify-center rounded-sm border border-black/8 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => { setDeleteOrgId(org.id); setDeleteOrgName(org.name); setDeleteOrgConfirmText(""); }}
                          disabled={deletingId === org.id}
                          className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/30 bg-white text-primary shadow-sm transition hover:bg-primary/5 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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

      {/* ═══ DANGER ZONE ═══ */}
      <div className="rounded-sm border border-red-500/20 bg-red-500/[0.04] p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.75} />
          <p className="text-[14px] font-semibold tracking-tight text-red-500">Danger Zone</p>
        </div>

        <div className="space-y-3">
          {/* Pause Account */}
          <div className="flex items-center justify-between rounded-sm border border-black/8 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-black/8 bg-white text-amber-500 shadow-sm">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Pause Account</p>
                <p className="text-[11px] font-light leading-snug text-accent-foreground">Temporarily pause your account. You can resume anytime.</p>
              </div>
            </div>

            {terminateStep === "idle" ? (
              <button
                onClick={() => setShowTerminateDialog(true)}
                className="rounded-sm border border-amber-500/30 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-amber-600 shadow-sm transition hover:bg-amber-500/10"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleCancelTermination}
                disabled={cancelling}
                className="rounded-sm border border-emerald-500/30 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-emerald-600 shadow-sm transition hover:bg-emerald-500/10 disabled:opacity-50"
              >
                {cancelling ? "Resuming..." : "Resume Account"}
              </button>
            )}
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between rounded-sm border border-black/8 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
                <ShieldX className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Delete Account</p>
                <p className="text-[11px] font-light leading-snug text-accent-foreground">Permanently delete all data. This cannot be undone.</p>
              </div>
            </div>

            <button
              onClick={() => setDeleteStep(1)}
              className="rounded-sm bg-red-500 px-4 py-2 text-[12px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600"
            >
              Delete Account
            </button>
          </div>

          {/* Sign out */}
          <div className="flex items-center justify-between rounded-sm border border-black/8 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-black/8 bg-white text-neutral-700 shadow-sm">
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Sign out</p>
                <p className="text-[11px] font-light leading-snug text-accent-foreground">End your session on this device. You can sign in again anytime.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-sm border border-black/8 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-neutral-900 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Organization Dialog */}
      {deleteOrgId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-sm border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
              <Trash2 className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-neutral-900">Delete project</h3>
            <p className="mb-4 text-left text-[13px] font-light leading-relaxed text-accent-foreground">
              This will remove all analysis runs and data for this project. Type the project name <strong className="font-semibold text-neutral-900">&ldquo;{deleteOrgName}&rdquo;</strong> to confirm.
            </p>
            <label className="mb-1.5 block text-left text-[11px] font-semibold tracking-tight text-accent-foreground">Project name</label>
            <input
              type="text"
              value={deleteOrgConfirmText}
              onChange={(e) => setDeleteOrgConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={deleteOrgName}
              className="mb-4 w-full rounded-sm border border-black/8 bg-white px-3 py-2.5 text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (deleteOrgId === null || deleteOrgConfirmText.trim() !== deleteOrgName.trim()) return;
                  handleDelete(deleteOrgId);
                  setDeleteOrgId(null);
                  setDeleteOrgName("");
                  setDeleteOrgConfirmText("");
                }}
                disabled={deletingId === deleteOrgId || deleteOrgConfirmText.trim() !== deleteOrgName.trim()}
                className="flex-1 rounded-sm bg-red-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === deleteOrgId ? "Deleting..." : "Delete project"}
              </button>
              <button
                onClick={() => { setDeleteOrgId(null); setDeleteOrgName(""); setDeleteOrgConfirmText(""); }}
                className="flex-1 rounded-sm border border-black/8 bg-white py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Account Dialog */}
      {showTerminateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-sm border border-black/8 bg-white p-6 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-black/8 bg-white text-amber-500 shadow-sm">
                <Clock className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">Pause Account</h3>
                <p className="text-[12px] font-light leading-snug text-accent-foreground">Temporarily pause your account</p>
              </div>
            </div>

            <div className="mb-5 rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-[12px] font-light leading-relaxed text-amber-600 dark:text-amber-400">
                Your account will be paused. You can <span className="font-semibold">resume anytime</span> from this settings page. While paused, scheduled analyses and integrations will be disabled.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTerminate}
                disabled={terminating}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-amber-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
              >
                {terminating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" strokeWidth={1.75} />}
                {terminating ? "Pausing..." : "Pause Account"}
              </button>
              <button
                onClick={() => setShowTerminateDialog(false)}
                className="rounded-sm border border-black/8 bg-white px-5 py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog — Step 1: Are you sure? */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-sm border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
              <ShieldX className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-neutral-900">Are you sure?</h3>
            <p className="mb-6 text-[13px] font-light leading-relaxed text-accent-foreground">
              You&apos;re about to delete your account. This will remove all your data permanently.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteStep(2)}
                className="flex-1 rounded-sm bg-red-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600"
              >
                Yes, continue
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="flex-1 rounded-sm border border-black/8 bg-white py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                No, go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog — Step 2: Type to confirm */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-sm border border-black/8 bg-white p-6 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
                <ShieldX className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">Delete Account Permanently</h3>
                <p className="text-[12px] font-light leading-snug text-accent-foreground">This action is irreversible</p>
              </div>
            </div>

            <div className="mb-4 rounded-sm border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[12px] font-light leading-relaxed text-red-500">
                This will permanently delete your account, all analysis runs, organizations, subscription data, and everything associated with <span className="font-semibold">{email}</span>. This cannot be undone.
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold tracking-tight text-accent-foreground">
                Type <span className="font-mono font-semibold text-neutral-900">delete my account</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my account"
                autoFocus
                className="w-full rounded-sm border border-black/8 bg-white px-3 py-2.5 font-mono text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== "delete my account"}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-red-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" strokeWidth={1.75} />}
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
              <button
                onClick={() => { setDeleteStep(0); setDeleteConfirmText(""); }}
                className="rounded-sm border border-black/8 bg-white px-5 py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
