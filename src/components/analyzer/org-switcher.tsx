"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useOrgStore } from "@/lib/stores/org-store";
import type { Organization } from "@/lib/api/organizations";
import { deleteOrganization } from "@/lib/api/organizations";
import { routes } from "@/lib/config";

interface OrgSwitcherProps {
  onOrgChange?: (org: Organization) => void;
}

export function OrgSwitcher({ onOrgChange }: OrgSwitcherProps) {
  const router = useRouter();
  const { organizations, activeOrg, setActiveOrg, setOrganizations } = useOrgStore();
  const [open, setOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [deleteNameConfirm, setDeleteNameConfirm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  function handleSelect(org: Organization) {
    setActiveOrg(org);
    setOpen(false);
    onOrgChange?.(org);
  }

  function handleDeleteClick(
    e: React.MouseEvent<HTMLButtonElement>,
    org: Organization,
  ) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setOpen(false);
    setDeleteNameConfirm("");
    setOrgToDelete(org);
  }

  async function handleDeleteConfirm() {
    if (!orgToDelete) return;
    if (deleteNameConfirm.trim() !== orgToDelete.name.trim()) return;

    setError("");
    setDeletingId(orgToDelete.id);
    try {
      await deleteOrganization(orgToDelete.id);
      const next = organizations.filter((o) => o.id !== orgToDelete.id);
      setOrganizations(next);

      if (activeOrg?.id === orgToDelete.id && next.length > 0) {
        setActiveOrg(next[0]);
        onOrgChange?.(next[0]);
      }
      if (next.length === 0) {
        setOpen(false);
      }
      setOrgToDelete(null);
      setDeleteNameConfirm("");
    } catch {
      setError("Failed to delete organization.");
    } finally {
      setDeletingId(null);
    }
  }

  const deleteNameMatches =
    orgToDelete != null &&
    deleteNameConfirm.trim() === orgToDelete.name.trim();

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          <span className="max-w-[160px] truncate">
            {activeOrg?.name ?? "Select project"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-border/70 bg-popover shadow-lg">
              <ul className="py-1">
                {organizations.map((org) => (
                  <li key={org.id}>
                    <div className="group flex items-center gap-1 px-1">
                      <button
                        onClick={() => handleSelect(org)}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent transition-colors"
                      >
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 ${activeOrg?.id === org.id ? "opacity-100" : "opacity-0"}`}
                        />
                        <span className="truncate">{org.name}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${org.name}`}
                        title={`Delete ${org.name}`}
                        onClick={(e) => handleDeleteClick(e, org)}
                        disabled={deletingId === org.id}
                        className="rounded-md p-1.5 text-muted-foreground opacity-70 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
                {error && (
                  <li className="px-3 py-1">
                    <p className="text-xs text-destructive">{error}</p>
                  </li>
                )}
                <li className="border-t border-border/50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push(routes.dashboard);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    New organization
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {orgToDelete && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100]">
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => {
                  if (deletingId) return;
                  setOrgToDelete(null);
                  setDeleteNameConfirm("");
                  setError("");
                }}
              />
              <div className="absolute left-1/2 top-1/2 z-10 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/70 bg-card p-6 shadow-2xl">
                <h2 className="text-lg font-semibold">Delete project</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This cannot be undone. Type the project name{" "}
                  <span className="font-medium text-foreground">&ldquo;{orgToDelete.name}&rdquo;</span>{" "}
                  to confirm.
                </p>

                <label className="mt-4 block text-left text-xs font-medium text-muted-foreground">
                  Project name
                </label>
                <input
                  type="text"
                  value={deleteNameConfirm}
                  onChange={(e) => setDeleteNameConfirm(e.target.value)}
                  autoComplete="off"
                  placeholder={orgToDelete.name}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                {error && (
                  <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (deletingId) return;
                      setOrgToDelete(null);
                      setDeleteNameConfirm("");
                      setError("");
                    }}
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
                    disabled={!!deletingId}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="rounded-md bg-destructive px-3 py-2 text-sm text-white hover:bg-destructive/90 disabled:opacity-50"
                    disabled={deletingId === orgToDelete.id || !deleteNameMatches}
                  >
                    {deletingId === orgToDelete.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
