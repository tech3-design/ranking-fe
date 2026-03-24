"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import {
  createOrganization,
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
} from "@/lib/api/organizations";
import { useOrgStore } from "@/lib/stores/org-store";
import { Loader2, Pencil, Trash2, Plus, Camera } from "lucide-react";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const userName = session?.user?.name || email.split("@")[0] || "User";
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const { setOrganizations } = useOrgStore();

  const [organizations, setLocalOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!email || !newName.trim()) return;
    setCreating(true); setError(null); setNotice(null);
    try {
      const created = await createOrganization({ name: newName.trim(), url: newUrl.trim(), email });
      const next = [created, ...organizations];
      setLocalOrgs(next); setOrganizations(next);
      setNewName(""); setNewUrl("");
      setNotice("Organization created.");
    } catch { setError("Failed to create organization."); }
    finally { setCreating(false); }
  }

  async function handleSave(id: number) {
    if (!editName.trim()) return;
    setSavingId(id); setError(null); setNotice(null);
    try {
      const updated = await updateOrganization(id, { name: editName.trim(), url: editUrl.trim() });
      const next = organizations.map((o) => (o.id === id ? updated : o));
      setLocalOrgs(next); setOrganizations(next);
      setEditingId(null);
      setNotice("Organization updated.");
    } catch { setError("Failed to update."); }
    finally { setSavingId(null); }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id); setError(null); setNotice(null);
    try {
      await deleteOrganization(id);
      const next = organizations.filter((o) => o.id !== id);
      setLocalOrgs(next); setOrganizations(next);
      if (editingId === id) setEditingId(null);
      setNotice("Organization deleted.");
    } catch { setError("Failed to delete."); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="px-6 py-6 space-y-6">
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

      {/* Organizations */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <p className="text-sm font-semibold text-foreground mb-1">Organizations</p>
        <p className="text-xs text-muted-foreground mb-4">Add, edit, or remove your organizations.</p>

        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <input
            placeholder="Organization name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="flex-1 bg-background rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 bg-background rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white bg-primary transition hover:opacity-90 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </button>
        </form>

        {loading ? (
          <div className="py-8 flex justify-center"><SignalorLoader size="sm" /></div>
        ) : organizations.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No organizations yet.</p>
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
                        <button onClick={() => handleDelete(org.id, org.name)} disabled={deletingId === org.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition border border-primary/30">
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
    </div>
  );
}
