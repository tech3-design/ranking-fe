"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization } from "@/lib/api/organizations";
import { useOrgStore } from "@/lib/stores/org-store";
import type { Organization } from "@/lib/api/organizations";
import { useSession } from "@/lib/auth-client";

interface CreateOrgDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (org: Organization) => void;
}

export function CreateOrgDialog({ open, onClose, onCreated }: CreateOrgDialogProps) {
  const { data: session } = useSession();
  const { organizations, setOrganizations } = useOrgStore();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const email = session?.user?.email ?? "";
      const org = await createOrganization({ name: name.trim(), url: url.trim(), email });
      setOrganizations([...organizations, org]);
      onCreated?.(org);
      setName("");
      setUrl("");
      onClose();
    } catch {
      setError("Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 z-10 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/70 bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Organization</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-url">Website URL</Label>
            <Input
              id="org-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
