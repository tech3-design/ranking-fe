"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/lib/config";
import { signOut, useSession } from "@/lib/auth-client";
import {
  createOrganization,
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
} from "@/lib/api/organizations";
import { useOrgStore } from "@/lib/stores/org-store";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const { setOrganizations } = useOrgStore();

  const [organizations, setLocalOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadOrganizations = useCallback(async () => {
    if (!email) return;
    try {
      setLoading(true);
      const data = await getOrganizations(email);
      setLocalOrganizations(data);
      setOrganizations(data);
    } catch {
      setError("Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [email, setOrganizations]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      router.push(routes.signIn);
    } finally {
      setSigningOut(false);
    }
  }

  async function handleCreateOrg(e: FormEvent) {
    e.preventDefault();
    if (!email || !newName.trim()) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const created = await createOrganization({
        name: newName.trim(),
        url: newUrl.trim(),
        email,
      });
      const next = [created, ...organizations];
      setLocalOrganizations(next);
      setOrganizations(next);
      setNewName("");
      setNewUrl("");
      setNotice("Organization created.");
    } catch {
      setError("Failed to create organization.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(org: Organization) {
    setEditingId(org.id);
    setEditName(org.name);
    setEditUrl(org.url ?? "");
    setError(null);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditUrl("");
  }

  async function handleSaveOrg(id: number) {
    if (!editName.trim()) return;
    setSavingId(id);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateOrganization(id, {
        name: editName.trim(),
        url: editUrl.trim(),
      });
      const next = organizations.map((org) => (org.id === id ? updated : org));
      setLocalOrganizations(next);
      setOrganizations(next);
      setEditingId(null);
      setNotice("Organization updated.");
    } catch {
      setError("Failed to update organization.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteOrg(id: number, name: string) {
    const confirmed = window.confirm(
      `Delete organization "${name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(id);
    setError(null);
    setNotice(null);
    try {
      await deleteOrganization(id);
      const next = organizations.filter((org) => org.id !== id);
      setLocalOrganizations(next);
      setOrganizations(next);
      if (editingId === id) {
        cancelEdit();
      }
      setNotice("Organization deleted.");
    } catch {
      setError("Failed to delete organization.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full overflow-hidden border border-border/60 bg-background/30">
        <AppSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Account</h1>
                <p className="mt-1 text-muted-foreground">
                  Manage your organizations and session.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600">
                {notice}
              </div>
            )}

            <Card className="glass-card border-border/70">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Signed in as {email}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/70">
              <CardHeader>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>
                  Edit name/URL or delete organizations from here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCreateOrg} className="grid gap-2 md:grid-cols-3">
                  <Input
                    placeholder="Organization name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                  <Button type="submit" disabled={creating || !newName.trim()}>
                    {creating ? "Creating..." : "Add Organization"}
                  </Button>
                </form>

                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading organizations...</p>
                ) : organizations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No organizations found for this account.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {organizations.map((org) => {
                      const isEditing = editingId === org.id;
                      return (
                        <div
                          key={org.id}
                          className="rounded-md border border-border/70 bg-background/60 p-3"
                        >
                          {isEditing ? (
                            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Organization name"
                              />
                              <Input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="https://example.com"
                              />
                              <Button
                                onClick={() => handleSaveOrg(org.id)}
                                disabled={savingId === org.id || !editName.trim()}
                              >
                                {savingId === org.id ? "Saving..." : "Save"}
                              </Button>
                              <Button variant="outline" onClick={cancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{org.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {org.url || "No URL"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEdit(org)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteOrg(org.id, org.name)}
                                  disabled={deletingId === org.id}
                                >
                                  {deletingId === org.id ? "Deleting..." : "Delete"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
