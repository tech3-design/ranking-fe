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
import { SignalorLoader } from "@/components/ui/signalor-loader";
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
    <div className="px-2 py-2 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Profile</h2>
        <p className="text-xs mt-1 text-muted-foreground">Manage your account and organizations.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-primary">{error}</div>
      )}
      {notice && (
        <div className="rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 px-4 py-3 text-sm text-[#22c55e]">{notice}</div>
      )}

      {/* Profile card */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <p className="text-sm font-semibold text-foreground mb-4">Account</p>
        <div className="flex items-center gap-5">
          <div className="relative group">
            <UserAvatar src={userImage} initials={userInitials} size={64} />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            {userImage && (
              <p className="text-[10px] text-muted-foreground mt-1">Photo from Google</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <p className="text-sm font-semibold text-foreground mb-1">Projects</p>
        <p className="text-xs text-muted-foreground mb-4">Add, edit, or remove your projects.</p>

        <button
          onClick={() => router.push("/onboarding/company-info")}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white bg-primary transition hover:opacity-90 mb-4"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Project
        </button>

        {loading ? (
          <div className="py-8 flex justify-center"><SignalorLoader size="sm" /></div>
        ) : organizations.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No projects yet.</p>
        ) : (
          <div className="space-y-2">
            {organizations.map((org) => {
              const isEditing = editingId === org.id;
              return (
                <div key={org.id} className="rounded-xl px-4 py-3 bg-background border border-border">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-card rounded-lg px-3 py-1.5 text-sm border border-border" />
                      <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="flex-1 bg-card rounded-lg px-3 py-1.5 text-sm border border-border" />
                      <button onClick={() => handleSave(org.id)} disabled={savingId === org.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary">
                        {savingId === org.id ? "..." : "Save"}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-border">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.url || "No URL"}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditingId(org.id); setEditName(org.name); setEditUrl(org.url ?? ""); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-card transition border border-border">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setDeleteOrgId(org.id); setDeleteOrgName(org.name); setDeleteOrgConfirmText(""); }} disabled={deletingId === org.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition border border-primary/30">
                          <Trash2 className="w-3.5 h-3.5" />
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
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-500">Danger Zone</p>
        </div>

        <div className="space-y-4">
          {/* Pause Account */}
          <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pause Account</p>
                <p className="text-[11px] text-muted-foreground">Temporarily pause your account. You can resume anytime.</p>
              </div>
            </div>

            {terminateStep === "idle" ? (
              <button
                onClick={() => setShowTerminateDialog(true)}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 transition"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleCancelTermination}
                disabled={cancelling}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 transition disabled:opacity-50"
              >
                {cancelling ? "Resuming..." : "Resume Account"}
              </button>
            )}
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <ShieldX className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-[11px] text-muted-foreground">Permanently delete all data. This cannot be undone.</p>
              </div>
            </div>

            <button
              onClick={() => setDeleteStep(1)}
              className="text-xs font-medium px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Delete Account
            </button>
          </div>

          {/* Sign out — end session only (does not delete data) */}
          <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sign out</p>
                <p className="text-[11px] text-muted-foreground">End your session on this device. You can sign in again anytime.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-xs font-medium px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Organization Dialog */}
      {deleteOrgId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl mx-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete project</h3>
            <p className="text-sm text-muted-foreground mb-4 text-left">
              This will remove all analysis runs and data for this project. Type the project name <strong className="text-foreground">&ldquo;{deleteOrgName}&rdquo;</strong> to confirm.
            </p>
            <label className="block text-left text-xs font-medium text-muted-foreground mb-1.5">Project name</label>
            <input
              type="text"
              value={deleteOrgConfirmText}
              onChange={(e) => setDeleteOrgConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={deleteOrgName}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
              >
                {deletingId === deleteOrgId ? "Deleting..." : "Delete project"}
              </button>
              <button
                onClick={() => { setDeleteOrgId(null); setDeleteOrgName(""); setDeleteOrgConfirmText(""); }}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition"
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
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Pause Account</h3>
                <p className="text-xs text-muted-foreground">Temporarily pause your account</p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 mb-5">
              <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                Your account will be paused. You can <span className="font-bold">resume anytime</span> from this settings page. While paused, scheduled analyses and integrations will be disabled.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTerminate}
                disabled={terminating}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition disabled:opacity-50"
              >
                {terminating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                {terminating ? "Pausing..." : "Pause Account"}
              </button>
              <button
                onClick={() => setShowTerminateDialog(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition"
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
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl mx-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Are you sure?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You&apos;re about to delete your account. This will remove all your data permanently.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteStep(2)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
              >
                Yes, continue
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition"
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
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Delete Account Permanently</h3>
                <p className="text-xs text-muted-foreground">This action is irreversible</p>
              </div>
            </div>

            <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3 mb-4">
              <p className="text-xs text-red-500 leading-relaxed">
                This will permanently delete your account, all analysis runs, organizations, subscription data, and everything associated with <span className="font-semibold">{email}</span>. This cannot be undone.
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Type <span className="font-mono font-semibold text-foreground">delete my account</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my account"
                autoFocus
                className="w-full bg-background rounded-xl px-3 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-red-500/30 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== "delete my account"}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
              <button
                onClick={() => { setDeleteStep(0); setDeleteConfirmText(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition"
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
